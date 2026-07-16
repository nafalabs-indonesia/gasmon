import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ appId: string }> }
) {
    const { appId } = await params;
    const owner = req.nextUrl.searchParams.get("owner");
    const rangeParam = req.nextUrl.searchParams.get("range");
    const days = Math.min(Math.max(Number(rangeParam) || 14, 1), 90);

    if (!owner) {
        return NextResponse.json({ error: "Missing owner wallet" }, { status: 400 });
    }

    try {
        const ownerCheck = await query(
            `SELECT app_id FROM apps WHERE app_id = $1 AND LOWER(owner_wallet) = LOWER($2) LIMIT 1`,
            [appId, owner]
        );

        if (ownerCheck.rowCount === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const [summaryResult, last24hResult, dailyResult, recentResult] = await Promise.all([
            query(
                `SELECT
                    COUNT(*)::int AS total_claims,
                    COALESCE(SUM(amount_wei), 0) AS total_wei,
                    COUNT(DISTINCT wallet_address)::int AS unique_wallets
                 FROM claims
                 WHERE app_id = $1`,
                [appId]
            ),
            query(
                `SELECT
                    COUNT(*)::int AS claims_24h,
                    COALESCE(SUM(amount_wei), 0) AS wei_24h
                 FROM claims
                 WHERE app_id = $1
                   AND created_at >= NOW() - INTERVAL '24 hours'`,
                [appId]
            ),
            query(
                `SELECT
                    DATE(created_at) AS day,
                    COUNT(*)::int AS count,
                    COALESCE(SUM(amount_wei), 0) AS amount_wei
                 FROM claims
                 WHERE app_id = $1
                   AND created_at >= NOW() - ($2 * INTERVAL '1 day')
                 GROUP BY DATE(created_at)
                 ORDER BY day ASC`,
                [appId, days]
            ),
            query(
                `SELECT wallet_address, amount_wei, tx_hash, created_at
                 FROM claims
                 WHERE app_id = $1
                 ORDER BY created_at DESC
                 LIMIT 25`,
                [appId]
            ),
        ]);

        const summary = summaryResult.rows[0] ?? { total_claims: 0, total_wei: "0", unique_wallets: 0 };
        const last24h = last24hResult.rows[0] ?? { claims_24h: 0, wei_24h: "0" };

        return NextResponse.json({
            summary: {
                totalClaims: Number(summary.total_claims) || 0,
                totalWei: summary.total_wei?.toString?.() ?? "0",
                uniqueWallets: Number(summary.unique_wallets) || 0,
                claims24h: Number(last24h.claims_24h) || 0,
                wei24h: last24h.wei_24h?.toString?.() ?? "0",
            },
            daily: dailyResult.rows.map((r: any) => ({
                day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day),
                count: Number(r.count) || 0,
                amountWei: r.amount_wei?.toString?.() ?? "0",
            })),
            recent: recentResult.rows.map((r: any) => ({
                walletAddress: r.wallet_address as string,
                amountWei: r.amount_wei?.toString?.() ?? "0",
                txHash: r.tx_hash as string | null,
                createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
            })),
        });
    } catch (error) {
        console.error("[api/apps/:appId/analytics] GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}