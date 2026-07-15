"use client";

import { useState, useEffect, use } from "react";
import { Fuel, Loader2, CheckCircle2, Wallet, AlertCircle } from "lucide-react";
import { useInjectedWallet } from "@/hooks/useInjectedWallet";

function getContrastColor(hexColor: string): "#000000" | "#ffffff" {
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return "#000000";
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function WidgetPage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    const wallet = useInjectedWallet();

    const [mounted, setMounted] = useState(false);
    const [accent, setAccent] = useState("#04ff2c");
    const [label, setLabel] = useState("Get Free Gas");
    const [colorMode, setColorMode] = useState("dark");

    const [status, setStatus] = useState<"idle" | "claiming" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            setAccent(searchParams.get("accent") || "#04ff2c");
            setLabel(searchParams.get("label") || "Get Free Gas");
            setColorMode(searchParams.get("mode") || "dark");
            setMounted(true);
        }
    }, []);

    const isDark = colorMode !== "light";
    const text = isDark ? "#f4f4f5" : "#0f172a";
    const subtext = isDark ? "#94a3b8" : "#475569";
    const border = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    const cardBg = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)";
    const buttonTextColor = getContrastColor(accent);

    const handleClaim = async () => {
        if (!wallet.address) {
            await wallet.connect();
            return;
        }

        setStatus("claiming");
        setErrorMsg(null);
        try {
            const res = await fetch("/api/topup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ app_id: appId, wallet: wallet.address }),
            });
            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                const rawError = data.error ?? "Failed to claim gas";
                if (rawError.includes("cooldown") || rawError.includes("wait")) {
                    setErrorMsg("Cooldown active.");
                } else if (rawError.includes("limit") || rawError.includes("quota")) {
                    setErrorMsg("Claim limit reached.");
                } else if (rawError.includes("insufficient") || rawError.includes("balance")) {
                    setErrorMsg("Vault depleted.");
                } else {
                    setErrorMsg(rawError.length > 25 ? "Failed to top up." : rawError);
                }
                return;
            }

            setTxHash(data.tx_hash);
            setStatus("success");
        } catch {
            setStatus("error");
            setErrorMsg("Network error.");
        }
    };

    if (!mounted) {
        return <div style={{ background: "transparent", width: "100%", height: "100%" }} />;
    }

    return (
        <div
            style={{
                background: "transparent",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 8px",
                fontFamily: "Inter, system-ui, -apple-system, sans-serif",
                boxSizing: "border-box"
            }}
        >
            <div
                style={{
                    width: "100%",
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "14px",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxSizing: "border-box"
                }}
            >
                {/* Icon Container - Hides on ultra-small mobile widths */}
                <div
                    className="gasmon-icon-container"
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: `${accent}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: `1px solid ${accent}25`,
                    }}
                >
                    {status === "error" ? (
                        <AlertCircle size={14} style={{ color: "#ef4444" }} />
                    ) : (
                        <Fuel size={14} style={{ color: accent }} />
                    )}
                </div>

                {/* Text Area - Responsive and truncate-safe */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {status === "success" ? (
                        <>
                            <p style={{ fontSize: "12px", fontWeight: 650, color: accent, display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
                                <CheckCircle2 size={12} /> Gas sent!
                            </p>
                            {txHash && (
                                <p style={{ fontSize: "9px", color: subtext, fontFamily: "monospace", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {txHash.slice(0, 16)}…
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: "12px", fontWeight: 650, color: status === "error" ? "#ef4444" : text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {status === "error" ? "Top-up Failed" : "Out of gas?"}
                            </p>
                            <p style={{ fontSize: "10px", color: subtext, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {status === "error" ? errorMsg : "Get a free top-up to continue"}
                            </p>
                        </>
                    )}
                </div>

                {/* Action Button */}
                {status !== "success" && (
                    <button
                        onClick={handleClaim}
                        disabled={status === "claiming"}
                        className="gasmon-widget-button"
                        style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background: accent,
                            color: buttonTextColor,
                            fontSize: "10.5px",
                            fontWeight: 700,
                            border: "none",
                            cursor: status === "claiming" ? "not-allowed" : "pointer",
                            transition: "opacity 0.15s, transform 0.1s active",
                            fontFamily: "Inter, system-ui, sans-serif",
                        }}
                    >
                        {status === "claiming" ? (
                            <Loader2 size={11} className="gasmon-spinner" />
                        ) : !wallet.address ? (
                            <Wallet size={11} />
                        ) : null}
                        {status === "claiming" ? "Sending…" : !wallet.address ? "Connect" : label}
                    </button>
                )}
            </div>

            {/* Global Rules for CSS integration inside Widget Frame */}
            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
                .gasmon-spinner {
                    animation: spin 0.8s linear infinite;
                }
                .gasmon-widget-button:hover {
                    opacity: 0.9;
                }
                .gasmon-widget-button:active {
                    transform: scale(0.96);
                }
                @media (max-width: 320px) {
                    .gasmon-icon-container {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}