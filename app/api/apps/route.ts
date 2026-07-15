import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { computeAppId } from "@/lib/app-id";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner")?.toLowerCase().trim();

  if (!owner) {
    return NextResponse.json({ error: "owner wallet is required" }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT * FROM apps WHERE owner_wallet = $1 ORDER BY created_at DESC`,
      [owner]
    );
    return NextResponse.json({ apps: result.rows });
  } catch (error) {
    console.error("[api/apps] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const domain = typeof body.domain === "string" ? body.domain.trim() : "";
    const ownerWallet = typeof body.owner_wallet === "string" ? body.owner_wallet.toLowerCase().trim() : "";

    if (!name || !domain || !ownerWallet) {
      return NextResponse.json({ error: "name, domain, and owner_wallet are required" }, { status: 400 });
    }

    // appId is derived from the domain — MUST match exactly what the frontend
    // uses when calling registerApp() on the contract (lib/app-id.ts).
    const appId = computeAppId(domain);

    const existing = await query(`SELECT id FROM apps WHERE app_id = $1`, [appId]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: "App with this domain already registered" }, { status: 409 });
    }

    const result = await query(
      `INSERT INTO apps (app_id, name, domain, owner_wallet)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [appId, name, domain, ownerWallet]
    );

    return NextResponse.json({ app: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("[api/apps] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}