"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEther } from "viem";
import {
    Loader2, AlertCircle, Users, Coins, Activity,
    Clock, ExternalLink, Copy, Check, BarChart3, RefreshCw
} from "lucide-react";
import Image from "next/image";
import { useWallet } from "@/context/WalletContext";

interface AppRow {
    id: number;
    app_id: string;
    name: string;
    domain: string;
}

interface AnalyticsTabProps {
    app: AppRow;
}

interface AnalyticsSummary {
    totalClaims: number;
    totalWei: string;
    uniqueWallets: number;
    claims24h: number;
    wei24h: string;
}

interface DailyPoint {
    day: string;
    count: number;
    amountWei: string;
}

interface RecentClaim {
    walletAddress: string;
    amountWei: string;
    txHash: string | null;
    createdAt: string;
}

type Range = "7" | "14" | "30";

const CARD = "bg-transparent border border-white/10 rounded-2xl p-5 sm:p-6 transition-colors duration-300";

function shortenAddress(addr: string) {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function shortenTx(hash: string) {
    if (!hash) return "";
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diffMs / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

function buildContinuousDaily(daily: DailyPoint[], days: number): DailyPoint[] {
    const map = new Map(daily.map((d) => [d.day, d]));
    const out: DailyPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setUTCHours(0, 0, 0, 0);
        d.setUTCDate(d.getUTCDate() - i);
        const key = d.toISOString().slice(0, 10);
        out.push(map.get(key) ?? { day: key, count: 0, amountWei: "0" });
    }
    return out;
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    sub?: string;
}) {
    return (
        <div className={CARD}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={13} className="text-gray-400" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-[#f4f4f5]">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition shrink-0"
            title="Copy address"
        >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
        </button>
    );
}

export function AnalyticsTab({ app }: AnalyticsTabProps) {
    const wallet = useWallet();
    const [range, setRange] = useState<Range>("14");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [daily, setDaily] = useState<DailyPoint[]>([]);
    const [recent, setRecent] = useState<RecentClaim[]>([]);

    const fetchAnalytics = useCallback(async (isBackground = false) => {
        if (!wallet.address) {
            setLoading(false);
            return;
        }
        if (!isBackground) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            const res = await fetch(
                `/api/apps/${app.app_id}/analytics?owner=${wallet.address}&range=${range}`
            );
            if (!res.ok) throw new Error("Failed to fetch analytics data");
            const data = await res.json();
            setSummary(data.summary);
            setDaily(data.daily ?? []);
            setRecent(data.recent ?? []);
        } catch (err) {
            console.error(err);
            setError("Could not load analytics data. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [wallet.address, app.app_id, range]);

    useEffect(() => {
        fetchAnalytics(false);
    }, [fetchAnalytics]);

    const continuousDaily = buildContinuousDaily(daily, Number(range));
    const maxCount = Math.max(1, ...continuousDaily.map((d) => d.count));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 size={22} className="animate-spin text-white/70" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Activity}
                    label="Total Claims"
                    value={summary?.totalClaims ?? 0}
                    sub={`${summary?.claims24h ?? 0} in last 24h`}
                />
                <StatCard
                    icon={Coins}
                    label="Total Distributed"
                    value={
                        <span className="flex items-center gap-1.5">
                            {Number(formatEther(BigInt(summary?.totalWei ?? "0"))).toFixed(4)}
                            <span className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5 inline-block">
                                <Image src="/monad.png" alt="MON" fill sizes="16px" className="object-cover" />
                            </span>
                        </span>
                    }
                    sub={`${Number(formatEther(BigInt(summary?.wei24h ?? "0"))).toFixed(4)} MON last 24h`}
                />
                <StatCard
                    icon={Users}
                    label="Unique Wallets"
                    value={summary?.uniqueWallets ?? 0}
                    sub="Distinct claimers all-time"
                />
                <StatCard
                    icon={Coins}
                    label="Avg / Claim"
                    value={
                        summary && summary.totalClaims > 0
                            ? (Number(formatEther(BigInt(summary.totalWei))) / summary.totalClaims).toFixed(4)
                            : "0.0000"
                    }
                    sub="MON per claim (all-time)"
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs border border-red-400/20 rounded-xl px-3.5 py-2.5">
                    <AlertCircle size={13} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Chart */}
            <div className={CARD}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={14} className="text-gray-400" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                            Claims Over Time
                        </p>
                        {refreshing && <Loader2 size={12} className="animate-spin text-gray-500" />}
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/5">
                        {(["7", "14", "30"] as Range[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${range === r ? "bg-white text-black" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {r}D
                            </button>
                        ))}
                        <button
                            onClick={() => fetchAnalytics(true)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-white transition"
                            title="Refresh"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>
                </div>

                {continuousDaily.every((d) => d.count === 0) ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <Activity size={18} className="text-gray-600" />
                        <p className="text-xs text-gray-500">No claims recorded in this period yet.</p>
                    </div>
                ) : (
                    <div className="flex items-end gap-1 sm:gap-1.5 h-40">
                        {continuousDaily.map((d) => {
                            const heightPct = Math.max(3, (d.count / maxCount) * 100);
                            const dateLabel = new Date(d.day + "T00:00:00Z").toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                            });
                            const monAmount = Number(formatEther(BigInt(d.amountWei || "0"))).toFixed(3);
                            return (
                                <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                    <div
                                        title={`${dateLabel} · ${d.count} claim${d.count === 1 ? "" : "s"} · ${monAmount} MON`}
                                        className={`w-full rounded-t-md transition-all duration-300 ${d.count > 0 ? "bg-[#04ff2c]/70 group-hover:bg-[#04ff2c]" : "bg-white/5"
                                            }`}
                                        style={{ height: `${heightPct}%` }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-between mt-2 px-0.5">
                    <span className="text-[10px] text-gray-600">
                        {new Date(continuousDaily[0]?.day + "T00:00:00Z").toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                    <span className="text-[10px] text-gray-600">Today</span>
                </div>
            </div>

            {/* Recent claims table */}
            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">
                    Recent Claims
                </p>

                {recent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <Clock size={18} className="text-gray-600" />
                        <p className="text-xs text-gray-500">No claims yet. They'll show up here as users top up.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {recent.map((c, i) => (
                            <div
                                key={`${c.txHash}-${i}`}
                                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono text-gray-200 bg-white/5 px-2 py-1 rounded border border-white/5 shrink-0">
                                        {shortenAddress(c.walletAddress)}
                                    </span>
                                    <CopyBtn text={c.walletAddress} />
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-xs font-mono text-[#04ff2c] font-semibold">
                                        +{Number(formatEther(BigInt(c.amountWei || "0"))).toFixed(4)} MON
                                    </span>
                                    <span className="text-[10px] text-gray-500 hidden sm:inline w-16 text-right">
                                        {timeAgo(c.createdAt)}
                                    </span>
                                    {c.txHash ? (
                                        <a
                                            href={`https://testnet.monadscan.com/tx/${c.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-white transition"
                                            title={c.txHash}
                                        >
                                            {shortenTx(c.txHash)}
                                            <ExternalLink size={10} />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-gray-600">—</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}