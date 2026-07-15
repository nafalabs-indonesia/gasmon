"use client";

import { useState } from "react";
import { Loader2, X, AlertCircle, Plus } from "lucide-react";
import { computeAppId } from "@/lib/app-id";
import { GAS_VAULT_CONTRACT } from "@/lib/vault-contract";
import { useWallet } from "@/context/WalletContext";

interface RegisterModalProps {
    onClose: () => void;
    onSuccess: () => void;
    walletAddress: string;
    walletClient: ReturnType<typeof useWallet>["getWalletClient"] extends () => infer R ? R : never;
}

export function RegisterModal({
    onClose,
    onSuccess,
    walletAddress,
    walletClient,
}: RegisterModalProps) {
    const [name, setName] = useState("");
    const [domain, setDomain] = useState("");
    const [step, setStep] = useState<"idle" | "onchain" | "saving">("idle");
    const [error, setError] = useState<string | null>(null);
    const busy = step !== "idle";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !domain.trim()) {
            setError("Name and domain are required.");
            return;
        }
        if (!walletClient) {
            setError("Wallet not ready.");
            return;
        }

        try {
            const appId = computeAppId(domain);

            setStep("onchain");
            await walletClient.writeContract({
                ...GAS_VAULT_CONTRACT,
                functionName: "registerApp",
                args: [appId],
            });

            setStep("saving");
            const res = await fetch("/api/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    domain: domain.trim(),
                    owner_wallet: walletAddress
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Failed to save app config");
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register app");
            setStep("idle");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-transparent border border-white/15 rounded-2xl p-6 animate-slide-up shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-lg tracking-tight">Register New App</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            This will call <code className="text-[#e4e4e7]">registerApp()</code> on Monad
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-[#f4f4f5] transition p-1.5 rounded-full border border-transparent hover:border-white/10"
                    >
                        <X size={17} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 block mb-1.5">App Name</label>
                        <input
                            type="text"
                            placeholder="e.g. My DeFi App"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={busy}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-[#f4f4f5] placeholder:text-gray-500 outline-none focus:border-white/30 transition disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-400 block mb-1.5">Domain</label>
                        <input
                            type="text"
                            placeholder="e.g. mydapp.xyz"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            disabled={busy}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/10 text-sm text-[#f4f4f5] placeholder:text-gray-500 outline-none focus:border-white/30 transition disabled:opacity-50"
                        />
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                            Used to derive your unique <code className="text-gray-500">appId</code> — must be consistent across your dApp.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs border border-red-400/20 rounded-xl px-3 py-2.5">
                            <AlertCircle size={13} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    {busy && (
                        <div className="flex items-center gap-3 border border-white/10 rounded-xl px-3.5 py-2.5">
                            <Loader2 size={14} className="animate-spin text-white shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-[#f4f4f5]">
                                    {step === "onchain" ? "Confirm in your wallet…" : "Saving configuration…"}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {step === "onchain" ? "Sign the transaction on Monad Testnet" : "Recording app in database"}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e4e4e7] transition disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        {busy ? (step === "onchain" ? "Waiting for signature…" : "Saving…") : "Register App"}
                    </button>
                </form>
            </div>
        </div>
    );
}