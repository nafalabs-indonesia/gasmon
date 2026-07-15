"use client";

import { useState } from "react";
import {
    Code2, Layers, Zap, Palette,
    AlignVerticalJustifyCenter, Monitor, Smartphone, Check, Copy, AlertCircle
} from "lucide-react";

interface AppRow {
    id: number;
    app_id: string;
    name: string;
    domain: string;
}

interface WidgetStudioProps {
    app: AppRow;
}

type WidgetMode = "iframe" | "floating" | "banner" | "react";
type PreviewDevice = "desktop" | "mobile";

const CARD = "bg-transparent border border-white/10 rounded-2xl p-5 transition-colors duration-300";

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <button
            onClick={copy}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${copied ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

export function WidgetStudio({ app }: WidgetStudioProps) {
    const [mode, setMode] = useState<WidgetMode>("iframe");
    const [accent, setAccent] = useState("#04ff2c");
    const [label, setLabel] = useState("Get Free Gas");
    const [darkMode, setDarkMode] = useState(true);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");

    const origin = typeof window !== "undefined" ? window.location.origin : "https://gasmon.app";
    const widgetUrl = `${origin}/widget/${app.app_id}?accent=${encodeURIComponent(accent)}&label=${encodeURIComponent(label)}&mode=${darkMode ? "dark" : "light"}`;

    const MODES: { id: WidgetMode; icon: React.ElementType; label: string; soon?: boolean; disabled?: boolean }[] = [
        { id: "iframe", icon: Code2, label: "iframe" },
        { id: "floating", icon: Zap, label: "Floating Button", soon: true, disabled: true },
        { id: "banner", icon: AlignVerticalJustifyCenter, label: "Banner", soon: true, disabled: true },
        { id: "react", icon: Layers, label: "React Component", soon: true, disabled: true },
    ];

    const iframeSnippet = `<iframe\n  src="${widgetUrl}"\n  width="100%"\n  height="80"\n  style="border:none;border-radius:16px;background:transparent;"\n  title="GasMon Gas Widget"\n></iframe>`;

    return (
        <div className="space-y-6 animate-fade-in">

            <div className={CARD}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Embed Mode</p>
                <div className="flex flex-wrap gap-2">
                    {MODES.map(({ id, icon: Icon, label: mLabel, soon, disabled }) => (
                        <button
                            key={id}
                            disabled={disabled && mode !== id}
                            onClick={() => !disabled && setMode(id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-300 relative
                                ${mode === id
                                    ? "bg-white text-black border-white"
                                    : "bg-transparent border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <Icon size={13} />
                            {mLabel}
                            {soon && (
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/10 text-gray-400 border border-white/10 ml-1 tracking-wider uppercase">
                                    Soon
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-7 space-y-6">
                    <div className={CARD}>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Customization</p>
                        <div className="divide-y divide-white/5 space-y-4">

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <Palette size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Accent Color</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="color"
                                        value={accent}
                                        onChange={(e) => setAccent(e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={accent}
                                        onChange={(e) => setAccent(e.target.value)}
                                        className="w-24 px-2.5 py-1.5 rounded-xl bg-transparent border border-white/10 text-xs font-mono text-white outline-none focus:border-white/30 text-center"
                                    />
                                </div>
                            </div>


                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2">
                                    <Code2 size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Button Label</span>
                                </div>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    maxLength={24}
                                    className="w-40 px-3 py-1.5 rounded-xl bg-transparent border border-white/10 text-xs text-white outline-none focus:border-white/30 text-right"
                                />
                            </div>


                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2">
                                    <Monitor size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-300">Color Scheme</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/5">
                                    {["dark", "light"].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setDarkMode(m === "dark")}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${(m === "dark") === darkMode
                                                ? "bg-white text-black"
                                                : "text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            {m.charAt(0).toUpperCase() + m.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Installation Code</p>
                        {mode === "iframe" ? (
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                        HTML / IFRAME
                                    </span>
                                    <CopyButton text={iframeSnippet} />
                                </div>
                                <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed select-all max-h-[180px]">
                                    {iframeSnippet}
                                </pre>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 text-xs text-gray-400 border border-white/10 rounded-2xl p-4 bg-white/[0.02]">
                                <AlertCircle size={14} className="text-gray-500" />
                                <span>Installation assets for this mode are currently being built and will be available soon.</span>
                            </div>
                        )}
                    </div>
                </div>


                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Live Mockup Preview</p>
                        <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/5">
                            {(["desktop", "mobile"] as PreviewDevice[]).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setPreviewDevice(d)}
                                    className={`p-1.5 rounded-full transition-colors duration-300 ${previewDevice === d ? "bg-white text-black" : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {d === "desktop" ? <Monitor size={13} /> : <Smartphone size={13} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        className={`border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-500 bg-[#0a0a0a] ${previewDevice === "mobile" ? "max-w-[280px] mx-auto h-[480px]" : "w-full h-[360px]"
                            }`}
                    >

                        <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border-b border-white/10 shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                            <div className="flex-1 ml-2 px-2 py-0.5 rounded bg-black/30 text-[10px] text-gray-500 font-mono truncate text-center">
                                {app.domain}
                            </div>
                        </div>


                        <div
                            className="flex-1 relative overflow-hidden flex items-center justify-center p-6 transition-colors duration-300"
                            style={{ background: darkMode ? "#0d0d0d" : "#fafafa" }}
                        >

                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <div className="w-12 h-12 rounded-full mb-3 bg-gray-500" />
                                <div className="h-4 w-32 rounded-md mb-2 bg-gray-500" />
                                <div className="h-3 w-48 rounded-md bg-gray-500" />
                            </div>


                            <div className="w-full z-10 transition-all duration-300 max-w-sm">
                                <iframe
                                    src={widgetUrl}
                                    className="w-full h-[76px] border-none block rounded-2xl bg-transparent"
                                    title="GasMon Live Preview Frame"
                                    key={widgetUrl} // Force reload iframe when theme config updates
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}