"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Loader2, ArrowLeft, Fuel, AlertCircle, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { publicClient } from "@/lib/public-client";
import { GAS_VAULT_CONTRACT } from "@/lib/vault-contract";
import { OverviewTab } from "@/components/apps/OverviewTab";
import { SettingsTab } from "@/components/apps/SettingsTab";
import { WidgetStudio } from "@/components/apps/WidgetStudio";
import { AnalyticsTab } from "@/components/apps/AnalyticsTab";

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

type Tab = "overview" | "analytics" | "settings" | "widget";

export default function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    const wallet = useWallet();
    const [app, setApp] = useState<AppRow | null>(null);
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tab, setTab] = useState<Tab>("overview");

    const fetchApp = useCallback(async (isBackground = false) => {
        if (!wallet.address) {
            setLoading(false);
            setIsRefreshing(false);
            return;
        }

        if (!isBackground) {
            setLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            const res = await fetch(`/api/apps?owner=${wallet.address}`);
            const data = await res.json();
            const found = (data.apps as AppRow[]).find((a) => a.app_id === appId);

            if (found) {
                if (found.owner_wallet.toLowerCase() !== wallet.address.toLowerCase()) {
                    setApp(null);
                } else {
                    setApp(found);
                    const bal = (await publicClient.readContract({
                        ...GAS_VAULT_CONTRACT,
                        functionName: "getAppBalance",
                        args: [found.app_id as `0x${string}`],
                    })) as bigint;
                    setBalance(bal);
                }
            } else {
                setApp(null);
            }
        } catch (err) {
            console.error("Failed to load app data:", err);
            setApp(null);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [wallet.address, appId]);

    useEffect(() => {
        fetchApp(false);
    }, [fetchApp]);

    const TABS: { id: Tab; label: string }[] = [
        { id: "overview", label: "Overview" },
        { id: "analytics", label: "Analytics" },
        { id: "settings", label: "Settings" },
        { id: "widget", label: "Widget Studio" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={24} className="animate-spin text-white/85" />
            </div>
        );
    }

    if (!wallet.address) {
        return (
            <div className="flex items-center justify-center min-h-[65vh] px-4">
                <div className="text-center max-w-sm border border-white/10 rounded-2xl p-6 bg-white/[0.02] backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Wallet size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">Wallet Disconnected</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Please connect your Web3 wallet using the connection button on the sidebar to verify your ownership and access the app details.
                    </p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="flex items-center justify-center min-h-[65vh] px-4">
                <div className="text-center max-w-md border border-red-500/10 rounded-2xl p-6 bg-red-950/5 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <ShieldAlert size={20} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold text-red-400 mb-1">Access Denied</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-5">
                        You do not have permission to view or manage this dApp. Make sure you are logged in with the registered owner wallet.
                    </p>
                    <Link
                        href="/dashboard/apps"
                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                    >
                        <ArrowLeft size={12} /> Back to My Apps
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl mx-auto space-y-6">

            <Link
                href="/dashboard/apps"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-white transition-colors"
            >
                <ArrowLeft size={13} />
                Back to My Apps
            </Link>


            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-[#f4f4f5] truncate">{app.name}</h1>
                        {isRefreshing && (
                            <span title="Updating balance...">
                                <Loader2 size={14} className="animate-spin text-gray-500" />
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{app.domain}</p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-gray-300 w-fit shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${app.is_active ? "bg-[#04ff2c] animate-pulse" : "bg-gray-500"}`} />
                    {app.is_active ? "Active" : "Paused"}
                </span>
            </div>


            <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/5 w-fit overflow-x-auto max-w-full">
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 shrink-0 ${tab === id
                            ? "bg-white text-black"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>


            <div className="pt-2">
                {tab === "overview" && (
                    <OverviewTab
                        app={app}
                        balance={balance}
                        walletClient={wallet.getWalletClient()}
                        onChanged={() => fetchApp(true)}
                    />
                )}
                {tab === "analytics" && (
                    <AnalyticsTab
                        app={app}
                    />
                )}
                {tab === "settings" && (
                    <SettingsTab
                        app={app}
                        onChanged={() => fetchApp(true)}
                    />
                )}
                {tab === "widget" && (
                    <WidgetStudio
                        app={app}
                    />
                )}
            </div>
        </div>
    );
}