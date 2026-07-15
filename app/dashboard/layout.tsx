import { Sidebar } from "@/components/Sidebar";
import { WalletProvider } from "@/context/WalletContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <WalletProvider>
            <div className="flex min-h-screen bg-surface-base">
                <Sidebar />
                <main className="flex-1 ml-0 lg:ml-[260px] min-h-screen overflow-y-auto pt-14 lg:pt-0">
                    {children}
                </main>
            </div>
        </WalletProvider>
    );
}