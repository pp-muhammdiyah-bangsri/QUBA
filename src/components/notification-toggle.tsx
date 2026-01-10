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

    // Initial check
    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
        checkSubscription();
    }, []);

    // Auto-subscribe effect
    useEffect(() => {
        if (permission === 'denied') return;
        if (isSubscribed) return;

        // Try to subscribe automatically
        // Note: Browsers might block this if not triggered by user gesture.
        // But for installed PWAs it often works.
        const timer = setTimeout(() => {
            subscribe();
        }, 1000); // Delay slightly to not block initial render

        return () => clearTimeout(timer);
    }, [permission, isSubscribed]);

    const checkSubscription = async () => {
        if (!("serviceWorker" in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (e) {
            console.error("Error checking subscription:", e);
        }
    };

    const subscribe = async () => {
        try {
            if (Notification.permission === "default") {
                // Request permission
                const perm = await Notification.requestPermission();
                setPermission(perm);
                if (perm !== "granted") return;
            } else if (Notification.permission === "denied") {
                return;
            }

            const vapidKey = await getVapidPublicKey();
            if (!vapidKey) return;

            if (!navigator.serviceWorker) return;

            // Get registration
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register("/sw.js");
            }
            if (!registration) return;

            // Wait for active
            if (!registration.active) {
                await new Promise<void>((resolve) => setTimeout(resolve, 500));
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            // Save to DB
            const subJson = subscription.toJSON();
            await savePushSubscription({
                endpoint: subJson.endpoint!,
                keys: {
                    p256dh: subJson.keys!.p256dh,
                    auth: subJson.keys!.auth,
                },
            });

            setIsSubscribed(true);
            console.log("Auto-subscribed successfully");
        } catch (err) {
            console.error("Auto-subscribe failed:", err);
            // Silent fail
        }
    };

    // Invisible component
    return null;
}
