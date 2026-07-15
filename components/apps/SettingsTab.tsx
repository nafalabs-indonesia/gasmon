"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import Image from "next/image";

interface AppRow {
    id: number;
    app_id: string;
    name: string;
    domain: string;
    owner_wallet: string;
    claim_amount_wei: string;
    max_claims_per_wallet: number;
    cooldown_hours: number;
    daily_budget_wei: string | null;
    is_active: boolean;
    created_at: string;
}

interface SettingsTabProps {
    app: AppRow;
    onChanged: () => void;
}

const CARD = "bg-transparent border border-white/10 rounded-2xl p-5 sm:p-6 transition-colors duration-300";

export function SettingsTab({ app, onChanged }: SettingsTabProps) {
    const [claimAmount, setClaimAmount] = useState((Number(app.claim_amount_wei) / 1e18).toString());
    const [maxClaims, setMaxClaims] = useState(String(app.max_claims_per_wallet));
    const [cooldown, setCooldown] = useState(String(app.cooldown_hours));
    const [dailyBudget, setDailyBudget] = useState(app.daily_budget_wei ? (Number(app.daily_budget_wei) / 1e18).toString() : "");
    const [isActive, setIsActive] = useState(app.is_active);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/apps/${app.app_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    claim_amount: claimAmount,
                    max_claims_per_wallet: Number(maxClaims),
                    cooldown_hours: Number(cooldown),
                    daily_budget: dailyBudget || null,
                    is_active: isActive,
                }),
            });
            onChanged();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 last:border-0 border-b border-white/5">
            <div>
                <p className="text-sm font-semibold text-[#f4f4f5]">{label}</p>
                {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
            </div>
            <div className="flex items-center shrink-0">{children}</div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={CARD}>
                <div className="divide-y divide-white/5">
                    <Field label="Claim Amount" hint="MON given per transaction/top-up">
                        <div className="flex items-center gap-2 bg-transparent border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-white/30 transition">
                            <input
                                type="text"
                                value={claimAmount}
                                onChange={(e) => setClaimAmount(e.target.value)}
                                className="w-20 bg-transparent text-sm font-mono text-[#f4f4f5] outline-none text-right"
                            />
                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                                <Image src="/monad.png" alt="MON" fill sizes="16px" className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-gray-400">MON</span>
                        </div>
                    </Field>

                    <Field label="Max Claims / Wallet" hint="Lifetime quota limit per visitor wallet">
                        <input
                            type="number"
                            min={1}
                            value={maxClaims}
                            onChange={(e) => setMaxClaims(e.target.value)}
                            className="w-28 px-3 py-2 rounded-xl bg-transparent border border-white/10 text-sm font-mono text-[#f4f4f5] outline-none text-right focus:border-white/30 transition"
                        />
                    </Field>

                    <Field label="Cooldown" hint="Hours required between claims">
                        <div className="flex items-center gap-2 bg-transparent border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-white/30 transition">
                            <input
                                type="number"
                                min={0}
                                value={cooldown}
                                onChange={(e) => setCooldown(e.target.value)}
                                className="w-16 bg-transparent text-sm font-mono text-[#f4f4f5] outline-none text-right"
                            />
                            <span className="text-xs text-gray-400 font-semibold">hours</span>
                        </div>
                    </Field>

                    <Field label="Daily Budget" hint="Total distribution cap per 24h (blank = unlimited)">
                        <div className="flex items-center gap-2 bg-transparent border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-white/30 transition">
                            <input
                                type="text"
                                value={dailyBudget}
                                placeholder="Unlimited"
                                onChange={(e) => setDailyBudget(e.target.value)}
                                className="w-24 bg-transparent text-sm font-mono text-[#f4f4f5] placeholder:text-gray-600 outline-none text-right"
                            />
                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                                <Image src="/monad.png" alt="MON" fill sizes="16px" className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-gray-400">MON</span>
                        </div>
                    </Field>

                    <Field label="Widget & Claim Active" hint="Temporarily pause user top-ups">
                        <button
                            onClick={() => setIsActive((v) => !v)}
                            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isActive ? "bg-white" : "bg-white/10"}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-300 ${isActive ? "left-[22px] bg-black" : "left-0.5 bg-gray-400"}`} />
                        </button>
                    </Field>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition disabled:opacity-50"
            >
                {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : saved ? (
                    <Check size={14} />
                ) : null}
                {saved ? "Saved!" : saving ? "Saving Settings…" : "Save Settings"}
            </button>
        </div>
    );
}