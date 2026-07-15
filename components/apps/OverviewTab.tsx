"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { Loader2, AlertCircle, Copy, Check, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { GAS_VAULT_CONTRACT } from "@/lib/vault-contract";

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

interface OverviewTabProps {
    app: AppRow;
    balance: bigint;
    walletClient: any;
    onChanged: () => void;
}

const CARD = "bg-transparent border border-white/10 rounded-2xl p-5 sm:p-6 transition-colors duration-300";

export function OverviewTab({ app, balance, walletClient, onChanged }: OverviewTabProps) {
    const [depositAmt, setDepositAmt] = useState("");
    const [depositing, setDepositing] = useState(false);

    const [withdrawAmt, setWithdrawAmt] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    const [err, setErr] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState(false);

    // State untuk Modal Sukses (Tanpa reload)
    const [successModal, setSuccessModal] = useState<{
        isOpen: boolean;
        type: "deposit" | "withdraw" | null;
        amount: string;
        txHash: string;
    }>({
        isOpen: false,
        type: null,
        amount: "",
        txHash: "",
    });

    const handleTxError = (e: any, context: "deposit" | "withdraw") => {
        const rawMessage = e instanceof Error ? e.message : String(e);
        const actionText = context === "deposit" ? "Deposit" : "Withdrawal";

        if (
            rawMessage.includes("User rejected") ||
            rawMessage.includes("User denied") ||
            rawMessage.includes("rejected the request")
        ) {
            setErr("Transaction rejected. You denied the signature request in your wallet.");
        } else if (rawMessage.includes("insufficient funds")) {
            setErr(`Insufficient funds. You do not have enough MON to complete this ${context}.`);
        } else if (rawMessage.includes("InsufficientBalance")) {
            setErr("Insufficient vault balance. You cannot withdraw more than what is stored in the vault.");
        } else {
            const shortMessage = rawMessage.split("\n")[0] || `${actionText} failed. Please try again.`;
            setErr(shortMessage);
        }
    };

    const handleDeposit = async () => {
        if (!walletClient || !depositAmt) return;
        setDepositing(true);
        setErr(null);
        try {
            // Panggil smart contract deposit
            const txHash = await walletClient.writeContract({
                ...GAS_VAULT_CONTRACT,
                functionName: "deposit",
                args: [app.app_id as `0x${string}`],
                value: parseEther(depositAmt),
            });

            const currentAmt = depositAmt;
            setDepositAmt("");

            // Tampilkan modal sukses dengan tautan MonadScan
            setSuccessModal({
                isOpen: true,
                type: "deposit",
                amount: currentAmt,
                txHash: txHash,
            });

            // Perbarui data balance di background tanpa mengganggu UI/reload halaman
            onChanged();
        } catch (e: any) {
            handleTxError(e, "deposit");
        } finally {
            setDepositing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!walletClient || !withdrawAmt) return;
        setWithdrawing(true);
        setErr(null);
        try {
            // Panggil smart contract withdraw
            const txHash = await walletClient.writeContract({
                ...GAS_VAULT_CONTRACT,
                functionName: "withdraw",
                args: [
                    app.app_id as `0x${string}`,
                    parseEther(withdrawAmt)
                ],
            });

            const currentAmt = withdrawAmt;
            setWithdrawAmt("");

            // Tampilkan modal sukses dengan tautan MonadScan
            setSuccessModal({
                isOpen: true,
                type: "withdraw",
                amount: currentAmt,
                txHash: txHash,
            });

            // Perbarui data balance di background tanpa mengganggu UI/reload halaman
            onChanged();
        } catch (e: any) {
            handleTxError(e, "withdraw");
        } finally {
            setWithdrawing(false);
        }
    };

    const handleCopyAppId = () => {
        navigator.clipboard.writeText(app.app_id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const claimMon = Number(formatEther(BigInt(app.claim_amount_wei)));
    const claimsRemaining = balance > BigInt(0) ? Math.floor(Number(balance) / Number(BigInt(app.claim_amount_wei))) : 0;
    const progressCeiling = Math.max(50, claimsRemaining);
    const pct = claimsRemaining > 0 ? Math.min((claimsRemaining / progressCeiling) * 100, 100) : 0;
    const formattedBalance = Number(formatEther(balance));

    return (
        <div className="space-y-6 animate-fade-in relative">

            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Vault Balance</p>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]">
                        {formattedBalance.toFixed(4)}
                    </span>
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/5">
                        <Image src="/monad.png" alt="MON" fill sizes="24px" className="object-cover" />
                    </div>
                    <span className="text-gray-400 font-sans font-semibold text-lg">MON</span>
                </div>


                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-white/80 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-mono tabular-nums">
                    <span>~{claimsRemaining} claim{claimsRemaining !== 1 ? "s" : ""} remaining at {claimMon.toFixed(4)}</span>
                    <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-white/5">
                        <Image src="/monad.png" alt="MON" fill sizes="14px" className="object-cover" />
                    </div>
                    <span className="font-sans font-semibold">MON</span>
                    <span>each</span>
                </div>
            </div>


            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Deposit MON</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative flex items-center bg-transparent border border-white/10 rounded-xl focus-within:border-white/30 transition">
                        <input
                            type="number"
                            placeholder="0.00"
                            value={depositAmt}
                            onChange={(e) => setDepositAmt(e.target.value)}
                            disabled={depositing || withdrawing}
                            className="w-full pl-4 pr-16 py-2.5 bg-transparent text-sm text-[#f4f4f5] placeholder:text-gray-500 outline-none disabled:opacity-50 font-mono"
                        />
                        <div className="absolute right-4 flex items-center gap-1.5 pointer-events-none">
                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                                <Image src="/monad.png" alt="MON" fill sizes="16px" className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-gray-400">MON</span>
                        </div>
                    </div>
                    <button
                        onClick={handleDeposit}
                        disabled={depositing || withdrawing || !depositAmt}
                        className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {depositing && <Loader2 size={14} className="animate-spin" />}
                        Deposit
                    </button>
                </div>


                <div className="flex flex-wrap gap-2 mt-4">
                    {["0.1", "0.5", "1", "5"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setDepositAmt(v)}
                            disabled={depositing || withdrawing}
                            className="px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 text-xs font-mono text-gray-400 hover:text-white transition-all disabled:opacity-40"
                        >
                            +{v} MON
                        </button>
                    ))}
                </div>
            </div>


            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Withdraw Unused MON</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative flex items-center bg-transparent border border-white/10 rounded-xl focus-within:border-white/30 transition">
                        <input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmt}
                            onChange={(e) => setWithdrawAmt(e.target.value)}
                            disabled={depositing || withdrawing}
                            className="w-full pl-4 pr-16 py-2.5 bg-transparent text-sm text-[#f4f4f5] placeholder:text-gray-500 outline-none disabled:opacity-50 font-mono"
                        />
                        <div className="absolute right-4 flex items-center gap-1.5 pointer-events-none">
                            <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/5">
                                <Image src="/monad.png" alt="MON" fill sizes="16px" className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold text-gray-400">MON</span>
                        </div>
                    </div>
                    <button
                        onClick={handleWithdraw}
                        disabled={withdrawing || depositing || !withdrawAmt || balance === BigInt(0)}
                        className="px-6 py-2.5 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 text-sm font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {withdrawing && <Loader2 size={14} className="animate-spin" />}
                        Withdraw
                    </button>
                </div>


                <div className="flex flex-wrap gap-2 mt-4">
                    {[
                        { label: "0.1", val: "0.1" },
                        { label: "0.5", val: "0.5" },
                        { label: "1", val: "1" },
                        { label: "Max", val: formatEther(balance) }
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setWithdrawAmt(item.val)}
                            disabled={depositing || withdrawing || balance === BigInt(0)}
                            className="px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25 text-xs font-mono text-gray-400 hover:text-white transition-all disabled:opacity-40"
                        >
                            {item.label === "Max" ? "Max" : `-${item.val} MON`}
                        </button>
                    ))}
                </div>
            </div>


            {err && (
                <div className="flex items-center gap-2 text-red-400 text-xs border border-red-400/20 rounded-xl px-3.5 py-2.5 mt-3">
                    <AlertCircle size={13} className="shrink-0" />
                    {err}
                </div>
            )}


            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">App Information</p>
                <div className="space-y-3.5 text-sm">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-2 border-b border-white/5">
                        <span className="text-gray-400 font-medium text-xs sm:text-sm">App ID</span>
                        <div className="flex items-center gap-2 max-w-full">
                            <span className="text-gray-200 break-all text-xs sm:text-sm font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                                {app.app_id}
                            </span>
                            <button
                                onClick={handleCopyAppId}
                                className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition shrink-0"
                                title="Copy App ID"
                            >
                                {copiedId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                        </div>
                    </div>

                    {[
                        { label: "Domain", value: app.domain, mono: false },
                        { label: "Owner Wallet", value: app.owner_wallet, mono: true },
                        { label: "Registration Date", value: new Date(app.created_at).toLocaleString(), mono: false },
                    ].map(({ label, value, mono }) => (
                        <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0 last:pb-0">
                            <span className="text-gray-400 font-medium text-xs sm:text-sm">{label}</span>
                            <span className={`text-gray-200 break-all text-xs sm:text-sm ${mono ? "font-mono" : ""}`}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>


            {successModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl">

                        <button
                            onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                            <X size={16} />
                        </button>

                        <div className="text-center space-y-4">

                            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <Check className="text-emerald-400" size={24} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">
                                    Transaction Successful!
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Your {successModal.type === "deposit" ? "deposit" : "withdrawal"} of{" "}
                                    <strong className="text-white font-mono">{successModal.amount} MON</strong> was processed successfully.
                                </p>
                            </div>


                            {successModal.txHash && (
                                <div className="pt-2">
                                    <a
                                        href={`https://testnet.monadscan.com/tx/${successModal.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition"
                                    >
                                        View on MonadScan
                                        <ExternalLink size={13} />
                                    </a>
                                </div>
                            )}


                            <button
                                onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                                className="w-full py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}