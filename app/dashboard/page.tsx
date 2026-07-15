"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";
import {
    Loader2, Plus, Wallet, Fuel, TrendingUp, Activity,
    ArrowRight, ChevronRight, AlertCircle, ExternalLink, Smartphone
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";
import { MOBILE_WALLET_LINKS } from "@/hooks/useInjectedWallet";
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

function ConnectWall() {
    const wallet = useWallet();
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center space-y-7 animate-slide-up w-full max-w-xs">
                <div className="relative w-14 h-14 mx-auto">
                    <Image
                        src="/icon-only.png"
                        alt="GasMon Icon"
                        fill
                        sizes="56px"
                        priority
                        className="object-contain"
                    />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome to GasMon</h1>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                        Connect your wallet to manage your apps and gas vaults on Monad.
                    </p>
                </div>

                {wallet.providers.length > 0 && (
                    <div className="space-y-2">
                        {wallet.providers.map((detail) => (
                            <button
                                key={detail.info.rdns}
                                onClick={() => wallet.connect(detail)}
                                disabled={wallet.connecting}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full ${CARD} disabled:opacity-50 text-left`}
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[#0a0a0a] flex items-center justify-center border border-white/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={detail.info.icon} alt={detail.info.name} className="w-4 h-4 object-contain" />
                                </div>
                                <span className="text-sm font-medium text-[#f4f4f5] truncate">
                                    {wallet.connecting ? "Connecting…" : detail.info.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {wallet.providers.length === 0 && !wallet.isMobile && (
                    <button
                        onClick={() => wallet.connect()}
                        disabled={wallet.connecting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition disabled:opacity-50"
                    >
                        <Wallet size={15} />
                        {wallet.connecting ? "Connecting…" : "Connect Wallet"}
                    </button>
                )}

                {wallet.isMobile && !wallet.hasInjectedProvider && (
                    <div className="space-y-2">
                        <p className="flex items-center gap-1.5 justify-center text-[10px] text-gray-500 uppercase tracking-widest">
                            <Smartphone size={11} />
                            Open in a wallet app
                        </p>
                        {MOBILE_WALLET_LINKS.map((w) => (
                            <a
                                key={w.name}
                                href={w.getLink(currentUrl)}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-full ${CARD}`}
                            >
                                <span className="text-sm font-medium text-[#f4f4f5]">{w.name}</span>
                                <ExternalLink size={13} className="text-gray-500" />
                            </a>
                        ))}
                    </div>
                )}

                {wallet.error && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5 justify-center mt-2">
                        <AlertCircle size={13} />{wallet.error}
                    </p>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, accent = false }: {
    label: string;
    value: React.ReactNode;
    icon: React.ElementType;
    accent?: boolean;
}) {
    return (
        <div className={`${CARD} rounded-2xl p-5 flex items-center gap-4 animate-slide-up`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${accent ? "border-white/25 text-white" : "border-white/10 text-[#d1d5db]"}`}>
                <Icon size={17} strokeWidth={1.75} />
            </div>
            <div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">{label}</p>
                <div className="text-xl font-semibold text-[#f4f4f5] tabular-nums">{value}</div>
            </div>
        </div>
    );
}

function AppCard({ app, balance }: { app: AppRow; balance: bigint }) {
    const balanceMon = Number(formatEther(balance)).toFixed(4);
    const claimMon = Number(formatEther(BigInt(app.claim_amount_wei))).toFixed(4);

    const claimAmount = BigInt(app.claim_amount_wei);
    const claimsLeft = balance > BigInt(0) && claimAmount > BigInt(0)
        ? Number(balance / claimAmount)
        : 0;

    const progressCeiling = Math.max(50, app.max_claims_per_wallet);
    const progressPct = claimsLeft > 0 ? Math.min((claimsLeft / progressCeiling) * 100, 100) : 0;

    return (
        <Link
            href={`/dashboard/apps/${app.app_id}`}
            className={`${CARD} rounded-2xl p-5 flex flex-col gap-4 group cursor-pointer animate-fade-in`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-[#f4f4f5] truncate tracking-tight">{app.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{app.domain}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10 text-gray-300">
                        <span className={`w-1.5 h-1.5 rounded-full ${app.is_active ? "bg-[#04ff2c] animate-pulse" : "bg-gray-500"}`} />
                        {app.is_active ? "Active" : "Paused"}
                    </span>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Vault balance</span>
                    <div className="flex items-center gap-1.5 font-mono text-gray-300 tabular-nums">
                        <span>{balanceMon}</span>
                        <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                            <Image
                                src="/monad.png"
                                alt="MON"
                                fill
                                sizes="16px"
                                className="object-cover"
                            />
                        </div>
                        <span className="text-gray-500 font-sans font-semibold text-xs">MON</span>
                    </div>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden border border-white/10">
                    <div
                        className="h-full bg-white/70 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1.5 tabular-nums">
                    <span>{claimsLeft} claim{claimsLeft !== 1 ? "s" : ""} remaining at {claimMon}</span>
                    <div className="relative w-3 h-3 rounded-full overflow-hidden shrink-0 border border-white/5">
                        <Image
                            src="/monad.png"
                            alt="MON"
                            fill
                            sizes="12px"
                            className="object-cover"
                        />
                    </div>
                    <span className="font-semibold">MON</span>
                    <span>each</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <p className="text-[10px] text-gray-500">
                    Max {app.max_claims_per_wallet} claim{app.max_claims_per_wallet !== 1 ? "s" : ""}/wallet
                </p>
                <ChevronRight
                    size={14}
                    className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                />
            </div>
        </Link>
    );
}

export default function DashboardPage() {
    const wallet = useWallet();
    const [apps, setApps] = useState<AppRow[]>([]);
    const [vaultBalances, setVaultBalances] = useState<Record<string, bigint>>({});
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

            const balances: Record<string, bigint> = {};
            await Promise.all(
                list.map(async (a) => {
                    const bal = (await publicClient.readContract({
                        ...GAS_VAULT_CONTRACT,
                        functionName: "getAppBalance",
                        args: [a.app_id as `0x${string}`],
                    })) as bigint;
                    balances[a.app_id] = bal;
                })
            );
            setVaultBalances(balances);
        } catch (err) {
            console.error("Failed to fetch apps:", err);
        } finally {
            setLoading(false);
        }
    }, [wallet.address]);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    if (!wallet.address) return <ConnectWall />;

    const totalBalance = Object.values(vaultBalances).reduce((a, b) => a + b, BigInt(0));
    const activeApps = apps.filter((a) => a.is_active).length;

    return (
        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your gas vaults and widget deployments
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Total Apps"
                    value={loading ? <span className="skeleton inline-block w-8 h-6" /> : apps.length}
                    icon={Activity}
                />
                <StatCard
                    label="Active Apps"
                    value={loading ? <span className="skeleton inline-block w-8 h-6" /> : activeApps}
                    icon={Fuel}
                    accent
                />
                <StatCard
                    label="Total Vault Balance"
                    value={loading ? (
                        <span className="skeleton inline-block w-20 h-6" />
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <span>{Number(formatEther(totalBalance)).toFixed(3)}</span>
                            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/5">
                                <Image
                                    src="/monad.png"
                                    alt="MON"
                                    fill
                                    sizes="20px"
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-gray-400 font-sans font-semibold text-sm">MON</span>
                        </div>
                    )}
                    icon={TrendingUp}
                />
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">My Apps</h2>
                {apps.length > 0 && (
                    <Link href="/dashboard/apps" className="text-xs text-gray-500 hover:text-white transition flex items-center gap-1">
                        View all <ArrowRight size={11} />
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className={`${CARD} rounded-2xl p-5 space-y-3 animate-pulse`}>
                            <div className="skeleton h-4 w-32 rounded" />
                            <div className="skeleton h-3 w-20 rounded" />
                            <div className="skeleton h-1.5 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            ) : apps.length === 0 ? (
                <div className={`${CARD} rounded-2xl p-8 sm:p-12 text-center animate-fade-in`}>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Fuel size={20} strokeWidth={1.75} className="text-white" />
                    </div>
                    <p className="font-semibold mb-2 tracking-tight">No apps yet</p>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                        Register your first dApp to start sponsoring gas top-ups for your users.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {apps.map((app) => (
                        <AppCard key={app.app_id} app={app} balance={vaultBalances[app.app_id] ?? BigInt(0)} />
                    ))}
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