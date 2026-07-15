// hooks/useInjectedWallet.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createWalletClient, custom } from "viem";
import { monadTestnet } from "@/lib/chains";

/* ── Types ───────────────────────────────────────────── */
export interface EIP1193Provider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
}

export interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string; // data: URI
    rdns: string; // e.g. "io.metamask"
}

export interface WalletProviderDetail {
    info: EIP6963ProviderInfo;
    provider: EIP1193Provider;
}

declare global {
    interface Window {
        ethereum?: EIP1193Provider & { providers?: EIP1193Provider[] };
    }
}

const LAST_WALLET_KEY = "gasmon:lastWalletRdns";

function isMobileUA() {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Deep links so mobile users without an injected wallet can open the dapp inside their wallet's browser */
export const MOBILE_WALLET_LINKS: { name: string; getLink: (url: string) => string }[] = [
    {
        name: "MetaMask",
        getLink: (url) => `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, "")}`,
    },
    {
        name: "Trust Wallet",
        getLink: (url) => `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`,
    },
    {
        name: "Rainbow",
        getLink: (url) => `https://rnbwapp.com/to?url=${encodeURIComponent(url)}`,
    },
    {
        name: "Coinbase Wallet",
        getLink: (url) => `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(url)}`,
    },
];

export function useInjectedWallet() {
    const [address, setAddress] = useState<`0x${string}` | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [providers, setProviders] = useState<WalletProviderDetail[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const activeProviderRef = useRef<EIP1193Provider | null>(null);
    const listenersRef = useRef<{
        accounts?: (...a: unknown[]) => void;
        chain?: (...a: unknown[]) => void;
        provider?: EIP1193Provider | null;
    }>({});

    const attachAndSync = useCallback((eth: EIP1193Provider | null) => {
        if (!eth) return;

        // detach listeners from a previously active provider (e.g. user switched wallets)
        const prev = listenersRef.current;
        if (prev.provider && prev.accounts && prev.chain) {
            prev.provider.removeListener?.("accountsChanged", prev.accounts);
            prev.provider.removeListener?.("chainChanged", prev.chain);
        }

        eth.request({ method: "eth_accounts" })
            .then((accounts) => {
                const list = accounts as string[];
                setAddress((list[0] as `0x${string}`) ?? null);
            })
            .catch(() => { });
        eth.request({ method: "eth_chainId" })
            .then((hex) => setChainId(parseInt(hex as string, 16)))
            .catch(() => { });

        const handleAccountsChanged = (...args: unknown[]) => {
            const accounts = args[0] as string[];
            setAddress((accounts[0] as `0x${string}`) ?? null);
            if (!accounts[0]) localStorage.removeItem(LAST_WALLET_KEY);
        };
        const handleChainChanged = (...args: unknown[]) =>
            setChainId(parseInt(args[0] as string, 16));

        eth.on?.("accountsChanged", handleAccountsChanged);
        eth.on?.("chainChanged", handleChainChanged);

        listenersRef.current = { accounts: handleAccountsChanged, chain: handleChainChanged, provider: eth };
        activeProviderRef.current = eth;
    }, []);

    /* ── Discover every injected wallet via EIP-6963, and pick a sane default ── */
    useEffect(() => {
        if (typeof window === "undefined") return;
        setIsMobile(isMobileUA());

        // Immediate fallback so the app still works with wallets that don't support EIP-6963 yet
        const legacyFallback: EIP1193Provider | null =
            window.ethereum?.providers?.[0] ?? window.ethereum ?? null;
        if (legacyFallback && !activeProviderRef.current) {
            attachAndSync(legacyFallback);
        }

        const handleAnnounce = (event: Event) => {
            const detail = (event as CustomEvent<WalletProviderDetail>).detail;
            if (!detail?.info?.rdns) return;

            setProviders((prev) =>
                prev.some((p) => p.info.rdns === detail.info.rdns) ? prev : [...prev, detail]
            );

            // If this announced wallet matches the last one the user connected with, make it active
            const lastRdns = localStorage.getItem(LAST_WALLET_KEY);
            if (lastRdns && detail.info.rdns === lastRdns) {
                attachAndSync(detail.provider);
            }
        };

        window.addEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
        window.dispatchEvent(new Event("eip6963:requestProvider"));

        return () => {
            window.removeEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            const prev = listenersRef.current;
            if (prev.provider && prev.accounts && prev.chain) {
                prev.provider.removeListener?.("accountsChanged", prev.accounts);
                prev.provider.removeListener?.("chainChanged", prev.chain);
            }
        };
    }, []);

    /* ── Connect: pass a specific EIP-6963 wallet detail, or omit to use the active/default provider ── */
    const connect = useCallback(
        async (detail?: WalletProviderDetail) => {
            setError(null);

            if (detail) {
                attachAndSync(detail.provider);
            }

            const eth = activeProviderRef.current;

            if (!eth) {
                setError(
                    isMobileUA()
                        ? "Wallet extension tidak terdeteksi. Buka situs ini lewat browser bawaan MetaMask / Trust Wallet / Rainbow di HP kamu."
                        : "No wallet extension detected. Install MetaMask or another EVM wallet."
                );
                return;
            }

            setConnecting(true);
            try {
                const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
                setAddress((accounts[0] as `0x${string}`) ?? null);
                const hex = (await eth.request({ method: "eth_chainId" })) as string;
                setChainId(parseInt(hex, 16));
                if (detail?.info.rdns) localStorage.setItem(LAST_WALLET_KEY, detail.info.rdns);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to connect wallet");
            } finally {
                setConnecting(false);
            }
        },
        [attachAndSync]
    );

    /** Clears local session state so the app forgets the wallet. Best-effort revokes
     *  permissions on wallets that support EIP-2255 (e.g. MetaMask); most injected
     *  wallets have no real "disconnect" RPC, so this is the standard dapp pattern. */
    const disconnect = useCallback(async () => {
        const eth = activeProviderRef.current;

        try {
            await eth?.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }],
            });
        } catch {
            // Not all wallets support wallet_revokePermissions — safe to ignore.
        }

        const prev = listenersRef.current;
        if (prev.provider && prev.accounts && prev.chain) {
            prev.provider.removeListener?.("accountsChanged", prev.accounts);
            prev.provider.removeListener?.("chainChanged", prev.chain);
        }
        listenersRef.current = {};
        activeProviderRef.current = null;

        setAddress(null);
        setChainId(null);
        setError(null);
        localStorage.removeItem(LAST_WALLET_KEY);
    }, []);

    const switchToMonadTestnet = useCallback(async () => {
        const eth = activeProviderRef.current;
        if (!eth) return;
        const targetHex = `0x${monadTestnet.id.toString(16)}`;
        try {
            await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
        } catch (err) {
            const code = (err as { code?: number })?.code;
            if (code === 4902) {
                await eth.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: targetHex,
                            chainName: monadTestnet.name,
                            nativeCurrency: monadTestnet.nativeCurrency,
                            rpcUrls: monadTestnet.rpcUrls.default.http,
                            blockExplorerUrls: [monadTestnet.blockExplorers?.default.url],
                        },
                    ],
                });
            } else {
                throw err;
            }
        }
    }, []);

    const getWalletClient = useCallback(() => {
        const eth = activeProviderRef.current;
        if (!eth || !address) return null;
        return createWalletClient({ account: address, chain: monadTestnet, transport: custom(eth) });
    }, [address]);

    const hasInjectedProvider =
        providers.length > 0 || (typeof window !== "undefined" && Boolean(window.ethereum));

    return {
        address,
        chainId,
        isOnMonadTestnet: chainId === monadTestnet.id,
        connecting,
        error,
        connect,
        disconnect,
        switchToMonadTestnet,
        getWalletClient,
        /** All wallet extensions detected via EIP-6963 (MetaMask, Rabby, OKX, Backpack, etc.) */
        providers,
        /** True if the device looks like a mobile phone (used to show wallet-app deep links) */
        isMobile,
        /** True if there's at least one usable injected/EIP-6963 provider */
        hasInjectedProvider,
    };
}