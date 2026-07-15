"use client";

import React, { createContext, useContext } from "react";
import { useInjectedWallet } from "@/hooks/useInjectedWallet";

type WalletContextType = ReturnType<typeof useInjectedWallet>;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const wallet = useInjectedWallet();
    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}