import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { query } from "@/lib/db";
import { getRelayerWalletClient } from "@/lib/relayer";
import { publicClient } from "@/lib/public-client";
import { GAS_VAULT_CONTRACT } from "@/lib/vault-contract";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const appId = typeof body.app_id === "string" ? body.app_id.trim() : "";
    const wallet = typeof body.wallet === "string" ? body.wallet.trim() : "";

    if (!appId || !wallet || !isAddress(wallet)) {
      return NextResponse.json({ error: "app_id and a valid wallet address are required" }, { status: 400 });
    }

    // 1. Fetch app config from DB
    const appResult = await query(`SELECT * FROM apps WHERE app_id = $1`, [appId]);
    if (appResult.rowCount === 0) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }
    const app = appResult.rows[0];

    if (!app.is_active) {
      return NextResponse.json({ error: "This app's gas widget is currently disabled" }, { status: 403 });
    }

    // 2. Check how many times this wallet has already claimed for this app
    const claimHistory = await query(
      `SELECT * FROM claims WHERE app_id = $1 AND wallet_address = $2 ORDER BY created_at DESC`,
      [appId, wallet.toLowerCase()]
    );

    if ((claimHistory.rowCount ?? 0) >= app.max_claims_per_wallet) {
      return NextResponse.json(
        { error: `This wallet has reached the max claims (${app.max_claims_per_wallet}) for this app.` },
        { status: 429 }
      );
    }

    // 3. If max_claims > 1, check cooldown since the last claim
    if ((claimHistory.rowCount ?? 0) > 0) {
      const lastClaim = new Date(claimHistory.rows[0].created_at);
      const hoursSince = (Date.now() - lastClaim.getTime()) / (1000 * 60 * 60);
      if (hoursSince < app.cooldown_hours) {
        const waitHours = Math.ceil(app.cooldown_hours - hoursSince);
        return NextResponse.json(
          { error: `Please wait ${waitHours} more hour(s) before claiming again.` },
          { status: 429 }
        );
      }
    }

    // 4. Optional: check daily budget if set
    if (app.daily_budget_wei) {
      const todayResult = await query(
        `SELECT COALESCE(SUM(amount_wei), 0) AS total
         FROM claims
         WHERE app_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
        [appId]
      );
      const spentToday = BigInt(todayResult.rows[0].total);
      const budget = BigInt(app.daily_budget_wei);
      const claimAmount = BigInt(app.claim_amount_wei);
      if (spentToday + claimAmount > budget) {
        return NextResponse.json({ error: "Daily gas budget for this app has been reached. Try again tomorrow." }, { status: 429 });
      }
    }

    // 5. Verify on-chain vault balance is sufficient
    const claimAmount = BigInt(app.claim_amount_wei);
    const vaultBalance = (await publicClient.readContract({
      ...GAS_VAULT_CONTRACT,
      functionName: "getAppBalance",
      args: [appId as `0x${string}`],
    })) as bigint;

    if (vaultBalance < claimAmount) {
      return NextResponse.json({ error: "This app's gas vault is currently out of funds." }, { status: 503 });
    }

    // 6. Execute on-chain transfer
    const relayerClient = getRelayerWalletClient();
    const hash = await relayerClient.writeContract({
      ...GAS_VAULT_CONTRACT,
      functionName: "topUp",
      args: [appId as `0x${string}`, wallet as `0x${string}`, claimAmount],
    });

    // 7. Record the claim in DB (for rate-limiting future claims)
    await query(
      `INSERT INTO claims (app_id, wallet_address, amount_wei, tx_hash) VALUES ($1, $2, $3, $4)`,
      [appId, wallet.toLowerCase(), claimAmount.toString(), hash]
    );

    return NextResponse.json({ success: true, tx_hash: hash, amount_wei: claimAmount.toString() });
  } catch (error) {
    console.error("[api/topup] error:", error);
    return NextResponse.json({ error: "Failed to process gas top-up" }, { status: 500 });
  }
}