"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { savePushSubscription, removePushSubscription, getVapidPublicKey, sendTestNotification } from "@/app/(dashboard)/notifications/actions";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationToggle() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }

        // Check if already subscribed
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    // Helper for timeout
    const withTimeout = <T,>(promise: Promise<T>, ms: number, msg: string): Promise<T> => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(msg)), ms);
            promise.then(
                (res) => { clearTimeout(timer); resolve(res); },
                (err) => { clearTimeout(timer); reject(err); }
            );
        });
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            // Request permission
            console.log("Requesting permission...");
            if (Notification.permission === "default") {
                alert("Mohon klik 'Allow' atau 'Izinkan' pada pop-up browser yang muncul.");
            }

            const perm = await withTimeout(
                Notification.requestPermission(),
                10000,
                "Timeout menunggu izin notifikasi. Cek setting browser Anda."
            );
            setPermission(perm);

            if (perm !== "granted") {
                alert("Izin notifikasi ditolak. Mohon izinkan di pengaturan browser.");
                setLoading(false);
                return;
            }

            // Get VAPID key
            console.log("Fetching VAPID key...");
            const vapidKey = await withTimeout(
                getVapidPublicKey(),
                10000,
                "Timeout mengambil VAPID key dari server. Cek koneksi internet."
            );
            console.log("VAPID key:", vapidKey ? "Found" : "Missing");

            if (!vapidKey) {
                alert("VAPID Public Key belum disetting di .env (Server). Hubungi admin.");
                setLoading(false);
                return;
            }

            // Subscribe to push
            console.log("Checking SW registration...");
            if (!navigator.serviceWorker) {
                alert("Service Worker not supported.");
                setLoading(false);
                return;
            }

            // Bypass .ready() and get registration directly
            let registration = await navigator.serviceWorker.getRegistration();

            if (!registration) {
                console.log("No registration found, registering...");
                try {
                    registration = await navigator.serviceWorker.register("/sw.js");
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    throw new Error("Register SW gagal: " + (e as any).message);
                }
            }

            if (!registration) throw new Error("Gagal mendapatkan SW registration");

            // Ensure active
            if (!registration.active) {
                console.log("SW not active yet. Waiting for activation...");
                await new Promise<void>((resolve) => {
                    const worker = registration!.installing || registration!.waiting;
                    if (worker) {
                        const listener = () => {
                            if (worker.state === 'activated') {
                                worker.removeEventListener('statechange', listener);
                                resolve();
                            }
                        };
                        worker.addEventListener('statechange', listener);
                        // Also check immediately if state changed
                        if (worker.state === 'activated') {
                            worker.removeEventListener('statechange', listener);
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                    // Timeout 5s for activation
                    setTimeout(resolve, 5000);
                });
            }

            // Double check active state
            if (!registration.active) {
                throw new Error("Service Worker belum aktif sepenuhnya. Mohon refresh halaman dan tunggu 5 detik sebelum coba lagi.");
            }

            console.log("SW active. Subscribing...");

            const subscription = await withTimeout(
                registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                }),
                10000,
                "Timeout tombol subscribe (PushManager). Coba lagi."
            );
            console.log("Subscribed!", subscription);

            // Save to database
            const subJson = subscription.toJSON();
            const saveResult = await savePushSubscription({
                endpoint: subJson.endpoint!,
                keys: {
                    p256dh: subJson.keys!.p256dh,
                    auth: subJson.keys!.auth,
                },
            });

            if (saveResult.error) {
                throw new Error("Gagal menyimpan ke database: " + saveResult.error);
            }

            setIsSubscribed(true);
            alert("Berhasil subscribe notifikasi!");
        } catch (err) {
            console.error("Error subscribing:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert(`Gagal subscribe: ${(err as any).message}`);
        }
        setLoading(false);
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                await removePushSubscription(subscription.endpoint);
            }

            setIsSubscribed(false);
        } catch (err) {
            console.error("Error unsubscribing:", err);
        }
        setLoading(false);
    };

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        return null; // Not supported
    }

    const handleTest = async () => {
        if (!isSubscribed) return;
        setLoading(true);
        try {
            const result = await sendTestNotification();
            if (result.error) {
                alert("Gagal dari server: " + result.error);
            } else {
                alert(`Server Berhasil: Terkirim ke ${result.sent} device. Cek notifikasi di HP/PC (mungkin ada delay).`);
            }
        } catch (err) {
            console.error("Test failed:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert("Gagal memanggil server: " + (err as any).message);
        }
        setLoading(false);
    };

    const handleTestLocal = async () => {
        if (!("serviceWorker" in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.showNotification("Test Lokal", {
                    body: "Ini adalah notifikasi lokal dari browser Anda (tanpa server).",
                    icon: "/icons/icon-192x192.png",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data: { url: window.location.href }
                });
            } else {
                alert("Service Worker not registered!");
            }
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert("Gagal showNotification local: " + (e as any).message);
        }
    };

    if (permission === "denied") {
        return (
            <Button variant="ghost" size="icon" disabled title="Notifikasi diblokir">
                <BellOff className="w-5 h-5 text-gray-400" />
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {isSubscribed && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTestLocal}
                        disabled={loading}
                        className="text-xs text-blue-500"
                    >
                        Test Local
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTest}
                        disabled={loading}
                        className="text-xs text-emerald-500"
                    >
                        Test Server
                    </Button>
                </>
            )}
            <Button
                variant="ghost"
                size="icon"
                onClick={isSubscribed ? unsubscribe : subscribe}
                disabled={loading}
                title={isSubscribed ? "Matikan notifikasi" : "Aktifkan notifikasi"}
                className={isSubscribed ? "text-emerald-500" : "text-gray-400"}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSubscribed ? (
                    <Bell className="w-5 h-5" />
                ) : (
                    <BellOff className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
}
