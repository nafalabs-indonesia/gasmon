"use client";

import { useState } from "react";
import {
    BookOpen, Cpu, Fuel, Code2,
    Terminal, ArrowRight, Copy, Check,
    ExternalLink, Layers, ShieldCheck, Palette, HelpCircle, Smartphone, Monitor
} from "lucide-react";
import Link from "next/link";

const CARD = "bg-transparent border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.01]";

function CopySnippet({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Code Snippet</span>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition ${copied ? "text-emerald-400" : "text-gray-400 hover:text-white"}`}
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {code}
            </pre>
        </div>
    );
}

export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-12 animate-fade-in text-[#f4f4f5]">


            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-monad/10 border border-monad/20 text-monad text-xs font-semibold">
                    <BookOpen size={13} />
                    Documentation
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                    Getting Started with GasMon
                </h1>
                <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl">
                    Sponsor transaction fees (gas) for your dApp users on Monad Testnet in minutes using our plug-and-play, no-code widget.
                </p>
            </div>

            <hr className="border-white/10" />


            <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <ShieldCheck className="text-monad" size={20} />
                    How GasMon Works
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                    GasMon utilizes a smart <strong>Gas Vault</strong> architecture where you deposit testnet MON into your application's dedicated vault. When users run completely out of gas on your dApp, they can request an instant gas top-up directly through the widget embedded in your site's UI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="border border-white/5 bg-white/[0.01] p-4 rounded-xl">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Step 1</div>
                        <div className="text-sm font-semibold text-white mb-1">Register dApp</div>
                        <p className="text-xs text-gray-400">Configure your application metadata and domain safety parameters.</p>
                    </div>
                    <div className="border border-white/5 bg-white/[0.01] p-4 rounded-xl">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Step 2</div>
                        <div className="text-sm font-semibold text-white mb-1">Fund Gas Vault</div>
                        <p className="text-xs text-gray-400">Deposit MON into your vault contract to pay for user transaction sponsorships.</p>
                    </div>
                    <div className="border border-white/5 bg-white/[0.01] p-4 rounded-xl">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Step 3</div>
                        <div className="text-sm font-semibold text-white mb-1">Embed Widget</div>
                        <p className="text-xs text-gray-400">Copy the iframe, style its layout, and drop it straight into your frontend code.</p>
                    </div>
                </div>
            </div>

            <hr className="border-white/10" />


            <div className="space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Cpu className="text-monad" size={20} />
                    Configuration Guide
                </h2>


                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400">1</span>
                        Create a New Application
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Go to the <Link href="/dashboard/apps" className="text-white underline hover:text-gray-300">My Apps</Link> section on your dashboard and click <strong>Register First App</strong>. Fill in your project settings:
                    </p>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-gray-400 space-y-2 pl-2">
                        <li><strong className="text-white">Name:</strong> The public name of your project (e.g., <em>My Dapp</em>).</li>
                        <li><strong className="text-white">Domain:</strong> The strict domain where you plan to embed the widget (e.g., <em>mydapp.xyz</em>, or <em>localhost:3000</em> during local development and testing).</li>
                        <li><strong className="text-white">Sponsorship Amount:</strong> The maximum MON sent to a single wallet address per claim (e.g., <em>0.1 MON</em>).</li>
                    </ul>
                </div>


                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400">2</span>
                        Deposit MON into Your Gas Vault
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        To enable gas payouts, you must fund your application's vault. In your application dashboard, click deposit and load testnet MON into the contract.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
                        <Fuel size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <strong className="block font-semibold mb-0.5">Need Testnet MON?</strong>
                            Please request initial test tokens from the official Monad Testnet faucet prior to funding your smart vault contract.
                        </div>
                    </div>
                </div>


                <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-gray-400">3</span>
                        Generate & Customize Your Widget
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Open your app settings and navigate to the <strong>Widget Studio</strong> tab. You can test interactions on the live interactive mockup, select theme palettes, customize buttons, and copy the ready-to-use HTML code block.
                    </p>
                </div>
            </div>

            <hr className="border-white/10" />


            <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Code2 className="text-monad" size={20} />
                    Technical Embedding Instructions
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                    To maintain strict safety boundaries and ensure your dApp style remains insulated from external changes, GasMon renders widgets inside a standard sandboxable <code>iframe</code>. This avoids any global CSS leaking into your codebase.
                </p>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Standard HTML Code Snippet</h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                        Copy and insert the following code block directly inside your page HTML structure:
                    </p>
                    <CopySnippet code={`<iframe
  src="https://gasmon.app/widget/YOUR_APP_ID?accent=%2304ff2c&label=Get%20Free%20Gas&mode=dark"
  width="100%"
  height="72"
  style="border: none; border-radius: 14px; background: transparent; overflow: hidden;"
  scrolling="no"
  title="GasMon Widget"
></iframe>`} />
                    <p className="text-xs text-gray-500 italic">
                        Note: Always remember to replace <code>YOUR_APP_ID</code> inside the URL with your unique application string.
                    </p>
                </div>


                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Making the Widget Responsive</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        The widget inside the iframe adapts itself perfectly down to very narrow screen widths. To make sure the iframe fits seamlessly into both mobile screen mockups and desktop grids, we highly recommend wrapping it inside a parent container that specifies a responsive limit:
                    </p>
                    <CopySnippet code={`<div style="width: 100%; max-width: 420px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
  <iframe
    src="https://gasmon.app/widget/YOUR_APP_ID?accent=%2304ff2c&label=Get%20Free%20Gas&mode=dark"
    width="100%"
    height="72"
    style="border: none; border-radius: 14px; background: transparent; overflow: hidden; display: block;"
    scrolling="no"
  ></iframe>
</div>`} />
                </div>


                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Integrating Dynamically in React / Next.js</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        To tie the widget state directly to your local application state, you can render it programmatically. This allows you to sync accent colors or switch theme schemes instantly whenever users toggle dark mode on your main website:
                    </p>
                    <CopySnippet code={`"use client";

import React from "react";

interface GasSponsorProps {
  appId: string;
  isDarkTheme: boolean;
  themeColorHex: string; // e.g., "#04ff2c"
  buttonText?: string;
}

export function GasMonSponsor({ appId, isDarkTheme, themeColorHex, buttonText = "Get Free Gas" }: GasSponsorProps) {
  const safeAccent = encodeURIComponent(themeColorHex);
  const safeLabel = encodeURIComponent(buttonText);
  const themeMode = isDarkTheme ? "dark" : "light";
  
  const iframeSrc = \`https://gasmon.app/widget/\${appId}?accent=\${safeAccent}&label=\${safeLabel}&mode=\${themeMode}\`;

  return (
    <div className="w-full max-w-md mx-auto">
      <iframe
        src={iframeSrc}
        width="100%"
        height="72"
        style={{ border: "none", borderRadius: "14px", background: "transparent", overflow: "hidden", display: "block" }}
        scrolling="no"
        title="GasMon Integration"
      />
    </div>
  );
}`} />
                </div>
            </div>

            <hr className="border-white/10" />


            <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                    <Palette className="text-monad" size={20} />
                    Customization URL Parameters
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                    The widget dynamically reads URL search queries to tailor its looks in real time. You can supply the following query inputs:
                </p>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-transparent">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400">
                                <th className="p-4 font-semibold">Parameter</th>
                                <th className="p-4 font-semibold">Default</th>
                                <th className="p-4 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="p-4 font-mono text-monad font-semibold">accent</td>
                                <td className="p-4 font-mono">#04ff2c</td>
                                <td className="p-4 text-gray-400">
                                    The primary theme color hex code for claim buttons, spinners, and accents. Make sure the value is URL-encoded (e.g. use %23 instead of #).
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 font-mono text-monad font-semibold">label</td>
                                <td className="p-4">Get Free Gas</td>
                                <td className="p-4 text-gray-400">
                                    Text content shown directly inside the action execution button. Spaces should be encoded as %20.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 font-mono text-monad font-semibold">mode</td>
                                <td className="p-4 font-mono">dark</td>
                                <td className="p-4 text-gray-400">
                                    Determines text coloring and inner opacity modes. Values must be either <code>dark</code> or <code>light</code>.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}