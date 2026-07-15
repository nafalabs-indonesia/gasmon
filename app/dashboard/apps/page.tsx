"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";
import { Fuel, Plus, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { GAS_VAULT_CONTRACT } from "@/lib/vault-contract";
import { publicClient } from "@/lib/public-client";
import { RegisterModal } from "@/components/RegisterModal";

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

const CARD = "bg-transparent border border-white/10 hover:border-white/20 transition-colors duration-300";

export default function AppsPage() {
    const wallet = useWallet();
    const [apps, setApps] = useState<AppRow[]>([]);
    const [balances, setBalances] = useState<Record<string, bigint>>({});
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const fetchApps = useCallback(async () => {
        if (!wallet.address) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/apps?owner=${wallet.address}`);
            const data = await res.json();
            const list: AppRow[] = data.apps ?? [];
            setApps(list);

            const bal: Record<string, bigint> = {};
            await Promise.all(
                list.map(async (a) => {
                    const b = (await publicClient.readContract({
                        ...GAS_VAULT_CONTRACT,
                        functionName: "getAppBalance",
                        args: [a.app_id as `0x${string}`],
                    })) as bigint;
                    bal[a.app_id] = b;
                })
            );
            setBalances(bal);
        } catch (err) {
            console.error("Failed to fetch apps:", err);
        } finally {
            setLoading(false);
        }
    }, [wallet.address]);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    return (
        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">My Apps</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        All registered dApps using GasMon
                    </p>
                </div>
                <button
                    onClick={() => setShowRegister(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition w-full sm:w-auto"
                >
                    <Plus size={15} />
                    New App
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`${CARD} rounded-2xl p-5 space-y-3 animate-pulse`}>
                            <div className="flex items-center gap-3">
                                <div className="skeleton w-10 h-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="skeleton h-4 w-32 rounded" />
                                    <div className="skeleton h-3 w-20 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : apps.length === 0 ? (
                <div className={`${CARD} rounded-2xl p-8 sm:p-12 text-center animate-fade-in`}>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Activity size={20} strokeWidth={1.75} className="text-white" />
                    </div>
                    <p className="font-semibold mb-2 tracking-tight">No apps registered</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        Register your first app config to start sponsoring gas top-ups.
                    </p>
                    <button
                        onClick={() => setShowRegister(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition"
                    >
                        <Plus size={14} />
                        Register First App
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {apps.map((app) => {
                        const bal = balances[app.app_id] ?? BigInt(0);
                        return (
                            <Link
                                key={app.app_id}
                                href={`/dashboard/apps/${app.app_id}`}
                                className={`${CARD} rounded-2xl p-5 flex items-center justify-between gap-4 group cursor-pointer`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0 text-[#d1d5db]">
                                        <Fuel size={17} strokeWidth={1.75} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#f4f4f5] truncate tracking-tight">{app.name}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{app.domain}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end font-mono text-xs text-gray-300 tabular-nums">
                                            <span>{Number(formatEther(bal)).toFixed(4)}</span>
                                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                                                <Image
                                                    src="/monad.png"
                                                    alt="MON"
                                                    fill
                                                    sizes="16px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="text-gray-500 font-sans font-semibold">MON</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-gray-400">
                                            <span className={`w-1.5 h-1.5 rounded-full ${app.is_active ? "bg-[#04ff2c] animate-pulse" : "bg-gray-500"}`} />
                                            {app.is_active ? "Active" : "Paused"}
                                        </span>
                                    </div>
                                    <ChevronRight
                                        size={14}
                                        className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {showRegister && wallet.address && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSuccess={fetchApps}
                    walletAddress={wallet.address}
                    walletClient={wallet.getWalletClient()}
                />
            )}
        </div>
    );
}