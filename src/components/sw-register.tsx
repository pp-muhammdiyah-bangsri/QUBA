"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator && typeof window !== "undefined") {
            const registerSW = async () => {
                try {
                    const registration = await navigator.serviceWorker.register("/sw.js", {
                        scope: "/",
                    });
                    console.log("SW registered: ", registration);

                    // Check for updates
                    if (registration.installing) {
                        console.log("Service worker installing");
                    } else if (registration.waiting) {
                        console.log("Service worker installed");
                    } else if (registration.active) {
                        console.log("Service worker active");
                    }

                    // Force update
                    await registration.update();
                } catch (error) {
                    console.error("SW registration failed: ", error);
                }
            };

            registerSW();
        }
    }, []);

    return null;
}
