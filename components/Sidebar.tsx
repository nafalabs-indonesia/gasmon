"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Cpu,
    BookOpen,
    ChevronRight,
    Zap,
    Wallet,
    LogOut,
    AlertTriangle,
    X,
    ExternalLink,
    Smartphone,
    Menu,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { MOBILE_WALLET_LINKS } from "@/hooks/useInjectedWallet";
import type { WalletProviderDetail } from "@/hooks/useInjectedWallet";

const NAV = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        category: "app"
    },
    {
        href: "/dashboard/apps",
        icon: Cpu,
        label: "My Apps",
        category: "app"
    },
    {
        href: "/dashboard/docs",
        icon: BookOpen,
        label: "Documentation",
        external: false,
        category: "resources"
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const wallet = useWallet(); // State wallet global[cite: 2]
    const [showConnectModal, setShowConnectModal] = useState(false); //[cite: 2]
    const [mobileOpen, setMobileOpen] = useState(false); //[cite: 2]

    const isWrongNetwork = wallet.address && !wallet.isOnMonadTestnet; //[cite: 2]

    // Tutup drawer mobile otomatis tiap kali pindah halaman
    useEffect(() => {
        setMobileOpen(false); //[cite: 2]
    }, [pathname]); //[cite: 2]

    // Cari nav item paling spesifik yang match pathname, biar "/dashboard" gak ikut
    // nyala waktu beneran lagi di "/dashboard/apps/..." (yang juga diawali "/dashboard")
    const activeHref = NAV
        .filter((item) => !item.external) //[cite: 2]
        .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/")) //[cite: 2]
        .sort((a, b) => b.href.length - a.href.length)[0]?.href; //[cite: 2]

    const handleConnect = (detail?: WalletProviderDetail) => {
        wallet.connect(detail); //[cite: 2]
        setShowConnectModal(false); //[cite: 2]
    };

    const currentUrl = typeof window !== "undefined" ? window.location.href : ""; //[cite: 2]

    return (
        <>

            <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[#121212] border-b border-[#262626] flex items-center justify-between px-4">
                <button
                    onClick={() => setMobileOpen(true)} //[cite: 2]
                    className="text-gray-300 hover:text-white transition-colors p-1 -ml-1"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <div className="relative w-28 h-7">
                    <Image
                        src="/GasMon.png"
                        alt="GasMon Logo"
                        fill
                        sizes="112px"
                        priority
                        className="object-contain object-right"
                    />
                </div>
            </div>


            {mobileOpen && ( //[cite: 2]
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)} //[cite: 2]
                />
            )}


            {showConnectModal && ( //[cite: 2]
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#171717] border border-[#333] rounded-xl shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-[#333] flex items-center justify-between">
                            <span className="font-medium text-white">Connect Wallet</span>
                            <button
                                onClick={() => setShowConnectModal(false)} //[cite: 2]
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-2 max-h-[60vh] overflow-y-auto">

                            {wallet.providers.length > 0 ? ( //[cite: 2]
                                wallet.providers.map((detail) => ( //[cite: 2]
                                    <button
                                        key={detail.info.rdns} //[cite: 2]
                                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left group"
                                        onClick={() => handleConnect(detail)} //[cite: 2]
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={detail.info.icon} alt={detail.info.name} className="w-5 h-5 object-contain" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                                            {detail.info.name}
                                        </span>
                                    </button>
                                ))
                            ) : !wallet.isMobile ? ( //[cite: 2]
                                // Desktop, no extension detected at all
                                <button
                                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left group"
                                    onClick={() => handleConnect()} //[cite: 2]
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center text-gray-400 group-hover:bg-monad-dim group-hover:text-monad transition-colors">
                                        <Wallet size={14} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                                        Injected Wallet
                                    </span>
                                </button>
                            ) : null}


                            {wallet.isMobile && !wallet.hasInjectedProvider && ( //[cite: 2]
                                <>
                                    <div className="px-3 pt-3 pb-1 flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider">
                                        <Smartphone size={11} />
                                        Open in wallet app
                                    </div>
                                    {MOBILE_WALLET_LINKS.map((w) => ( //[cite: 2]
                                        <a
                                            key={w.name} //[cite: 2]
                                            href={w.getLink(currentUrl)} //[cite: 2]
                                            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center text-gray-400 group-hover:bg-monad-dim group-hover:text-monad transition-colors">
                                                <ExternalLink size={13} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                                                {w.name}
                                            </span>
                                        </a>
                                    ))}
                                </>
                            )}
                        </div>

                        {wallet.error && ( //[cite: 2]
                            <div className="px-4 pb-4">
                                <p className="text-red-400 text-xs leading-relaxed">{wallet.error}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}


            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[260px] min-w-[260px] max-w-[260px] shrink-0 h-screen bg-[#121212] border-r border-[#262626]
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} //[cite: 2]
            >


                <div className="h-14 flex items-center justify-between px-4 pt-3 shrink-0">
                    <div className="relative w-full h-8">
                        <Image
                            src="/GasMon.png"
                            alt="GasMon Logo"
                            fill
                            sizes="(max-width: 260px) 100vw, 260px"
                            priority
                            className="object-contain object-left"
                        />
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)} //[cite: 2]
                        className="lg:hidden text-gray-500 hover:text-white transition-colors shrink-0 -mr-1 p-1"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>


                <div className="p-3 shrink-0">
                    {!wallet.address ? ( //[cite: 2]
                        <button
                            onClick={() => setShowConnectModal(true)} //[cite: 2]
                            className="w-full flex items-center justify-center gap-2 bg-[#171717] border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white h-9 rounded-md text-xs font-medium transition-colors"
                        >
                            <Wallet size={12} />
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="flex items-center justify-between bg-[#171717] border border-[#333] rounded-md p-2">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] text-gray-500 font-mono">Address</span>
                                <span className="text-xs font-mono text-gray-300 truncate max-w-[110px]">
                                    {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-monad bg-monad-dim px-1.5 py-0.5 rounded border border-monad/20">
                                    ACTIVE
                                </span>
                                <button
                                    onClick={() => wallet.disconnect()} //[cite: 2]
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                    title="Disconnect wallet"
                                >
                                    <LogOut size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
                    {NAV.map((item, index) => {
                        const Icon = item.icon; //[cite: 2]
                        const isActive = !item.external && item.href === activeHref; //[cite: 2]

                        const prevCategory = index > 0 ? NAV[index - 1].category : undefined; //[cite: 2]
                        const showLabel = item.category !== prevCategory; //[cite: 2]

                        const itemProps = {
                            className: `w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                                ${isActive
                                    ? "bg-[#1f1f1f] text-white"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-[#171717]"
                                }`
                        };

                        return (
                            <div key={item.href}>
                                {showLabel && ( //[cite: 2]
                                    <div className="px-3 py-2 mt-2">
                                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                            {item.category === "resources" ? "Resources" : "Navigation"}
                                        </p>
                                    </div>
                                )}

                                {item.external ? ( //[cite: 2]
                                    <a href={item.href} target="_blank" rel="noopener noreferrer" {...itemProps}>
                                        <Icon size={16} className={isActive ? "text-monad" : ""} />
                                        <span className="truncate">{item.label}</span>
                                        <ChevronRight size={14} className="ml-auto text-gray-600 opacity-60" />
                                    </a>
                                ) : (
                                    <Link href={item.href} onClick={() => setMobileOpen(false)} {...itemProps}>
                                        <Icon size={16} className={isActive ? "text-monad" : ""} />
                                        <span className="truncate">{item.label}</span>
                                        {isActive && <ChevronRight size={14} className="ml-auto text-gray-500" />}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>


                <div className="p-3 shrink-0">
                    {isWrongNetwork ? ( //[cite: 2]
                        <button
                            onClick={wallet.switchToMonadTestnet} //[cite: 2]
                            className="w-full flex items-center justify-center gap-2 text-[11px] font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 py-2 rounded-md border border-amber-400/30 transition-colors"
                        >
                            <AlertTriangle size={12} /> Switch to Monad
                        </button>
                    ) : (
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span>Network</span>
                            <span className="flex items-center gap-1.5 text-gray-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${wallet.address ? "bg-monad" : "bg-gray-600"}`} />
                                {wallet.address ? "Monad Testnet" : "Disconnected"}
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}