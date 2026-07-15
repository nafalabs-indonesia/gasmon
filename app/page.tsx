import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Code2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#04ff2c]/30">


      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl w-full mx-auto">
        <div className="relative w-36 h-9">
          <Image
            src="/GasMon.png"
            alt="GasMon Logo"
            fill
            sizes="144px"
            priority
            className="object-contain object-left"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-wider font-semibold px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)] text-[#a1a1aa] border border-[rgba(255,255,255,0.08)]">
            BUILDANYTHING HACKATHON
          </span>
        </div>
      </nav>


      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto pt-20 pb-28 relative">


        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-xs text-[#a1a1aa] mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#04ff2c] animate-pulse" />
          Gas sponsorship for dApps on Monad
        </div>


        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.1] mb-6">
          Everything you need to <span className="text-[#04ff2c]">sponsor gas</span>
        </h1>


        <p className="text-[#a1a1aa] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          GasMon lets your dApp sponsor a seamless first top-up for new users.
          Embed one snippet, fund a vault, and eliminate "insufficient funds" forever.
        </p>


        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e4e4e7] transition shadow-lg"
          >
            Get started <ArrowRight size={15} />
          </Link>
          <a
            href="https://testnet.monadscan.com/address/0x37896a97A92C5Fb8c990E3e02c21750d10c411CE"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-sm font-semibold text-white hover:bg-[rgba(255,255,255,0.08)] transition"
          >
            View on Explorer
          </a>
        </div>


        <div className="mt-24 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] rounded-2xl p-6 sm:p-8 w-full backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#52525b] font-bold mb-6 text-center sm:text-left">
            Trusted Framework Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {[
              { title: "One Embed", desc: "Paste an iframe or simple JS snippet into your app interface." },
              { title: "Fund a Vault", desc: "Deposit native MON tokens directly to fuel user onboarding." },
              { title: "Rate Limited", desc: "Advanced per-wallet caps and cooldowns prevent sybil drains." },
            ].map(({ title, desc }) => (
              <div key={title} className="space-y-1">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs text-[#71717a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      <footer className="text-center py-8 border-t border-[rgba(255,255,255,0.04)] text-xs text-[#52525b] max-w-7xl w-full mx-auto px-6">
        Built on Monad Testnet · GasMon © 2026
      </footer>
    </main>
  );
}