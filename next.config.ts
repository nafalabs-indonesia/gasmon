/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Halaman widget WAJIB bisa di-iframe dari domain lain (situs dApp
                // yang embed kita). "X-Frame-Options: ALLOWALL" BUKAN value valid
                // (browser modern gak ngenalin) — cara yang bener pakai CSP
                // frame-ancestors, yang emang didesain buat kasus ini.
                source: "/widget/:path*",
                headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *;" }],
            },
        ];
    },
};

module.exports = nextConfig;