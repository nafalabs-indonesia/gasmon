import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { parseEther } from "viem";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ appId: string }> }
) {
  const { appId } = await params;

  try {
    const body = await req.json();
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    // claim_amount is sent from the frontend in MON units (e.g. "0.01"),
    // converted to wei here to stay consistent with on-chain units.
    if (typeof body.claim_amount === "string" && body.claim_amount.trim() !== "") {
      fields.push(`claim_amount_wei = $${i++}`);
      values.push(parseEther(body.claim_amount.trim()).toString());
    }
    if (typeof body.max_claims_per_wallet === "number") {
      fields.push(`max_claims_per_wallet = $${i++}`);
      values.push(body.max_claims_per_wallet);
    }
    if (typeof body.cooldown_hours === "number") {
      fields.push(`cooldown_hours = $${i++}`);
      values.push(body.cooldown_hours);
    }
    if (typeof body.daily_budget === "string") {
      fields.push(`daily_budget_wei = $${i++}`);
      values.push(body.daily_budget.trim() === "" ? null : parseEther(body.daily_budget.trim()).toString());
    }
    if (typeof body.is_active === "boolean") {
      fields.push(`is_active = $${i++}`);
      values.push(body.is_active);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(appId);

    const result = await query(
      `UPDATE apps SET ${fields.join(", ")} WHERE app_id = $${i} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json({ app: result.rows[0] });
  } catch (error) {
    console.error("[api/apps/:appId] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}