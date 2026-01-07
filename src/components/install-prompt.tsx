"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Register service worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(console.error);
        }

        // Listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        // Don't show again for this session
        sessionStorage.setItem("pwa-dismissed", "true");
    };

    // Don't show if already dismissed this session
    useEffect(() => {
        if (sessionStorage.getItem("pwa-dismissed")) {
            setShowBanner(false);
        }
    }, []);

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-emerald-200 shadow-lg rounded-lg p-4 z-50 animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-emerald-600">Q</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Install QUBA</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Tambahkan ke layar utama untuk akses cepat
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={handleInstall} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            <Download className="w-4 h-4 mr-1" />
                            Install
                        </Button>
                        <Button onClick={handleDismiss} size="sm" variant="ghost">
                            Nanti
                        </Button>
                    </div>
                </div>
                <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
