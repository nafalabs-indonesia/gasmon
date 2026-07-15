import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GasMon — Sponsor-funded gas top-ups on Monad",
  description:
    "Give your dApp users a free gas top-up for their first transaction. Embed one widget, fund a vault, done.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-base text-[#f4f4f5] antialiased">{children}</body>
    </html>
  );
}