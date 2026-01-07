import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { InstallPrompt } from "@/components/install-prompt";
import { ServiceWorkerRegister } from "@/components/sw-register";

export const metadata: Metadata = {
    title: "QUBA - Catatan Perkembangan Santri",
    description: "Sistem Informasi Pondok Pesantren Muhammadiyah Bangsri",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "QUBA",
    },
};

export const viewport: Viewport = {
    themeColor: "#059669",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </head>
            <body className="antialiased" suppressHydrationWarning>
                <ThemeProvider defaultTheme="system">
                    <ToastProvider>
                        {children}
                        <InstallPrompt />
                        <ServiceWorkerRegister />
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}