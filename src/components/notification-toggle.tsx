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
            console.log("Waiting for SW ready...");
            if (!navigator.serviceWorker) {
                alert("Service Worker not supported.");
                setLoading(false);
                return;
            }

            const registration = await withTimeout(
                navigator.serviceWorker.ready,
                10000,
                "Timeout menunggu Service Worker. Coba refresh halaman."
            );
            console.log("SW Ready. Subscribing...");

            const subscription = await withTimeout(
                registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                }),
                10000,
                "Timeout saat proses subscribe ke push service."
            );
            console.log("Subscribed!", subscription);

            // Save to database
            const subJson = subscription.toJSON();
            await savePushSubscription({
                endpoint: subJson.endpoint!,
                keys: {
                    p256dh: subJson.keys!.p256dh,
                    auth: subJson.keys!.auth,
                },
            });

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
            await sendTestNotification();
            alert("Test notifikasi dikirim! Cek notifikasi di HP/PC Anda.");
        } catch (err) {
            console.error("Test failed:", err);
            alert("Gagal mengirim test notifikasi.");
        }
        setLoading(false);
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTest}
                    disabled={loading}
                    className="text-xs text-emerald-500"
                >
                    Test Push
                </Button>
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
