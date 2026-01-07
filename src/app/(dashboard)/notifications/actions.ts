"use server";

import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

// VAPID keys - generate your own at: https://vapidkeys.com/
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@quba.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

// Save push subscription to database
export async function savePushSubscription(subscription: PushSubscription) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from("push_subscriptions")
        .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        }, { onConflict: "endpoint" });

    if (error) {
        console.error("Error saving push subscription:", error);
        return { error: error.message };
    }

    return { success: true };
}

// Remove push subscription
export async function removePushSubscription(endpoint: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint);

    return { success: true };
}

// Send notification to specific user
export async function sendNotificationToUser(userId: string, title: string, body: string, url?: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions } = await (supabase as any)
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
        return { sent: 0 };
    }

    const payload = JSON.stringify({ title, body, url });
    let sent = 0;

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
            );
            sent++;
        } catch (err: any) {
            // Remove invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
                await removePushSubscription(sub.endpoint);
            }
        }
    }

    return { sent };
}

// Broadcast notification to all users or by role
export async function broadcastNotification(title: string, body: string, targetRole?: string) {
    const supabase = await createClient();

    // Get current user for logging
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let query = (supabase as any)
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, user_id");

    // If targeting specific role, join with profiles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subscriptions: any[] = [];

    if (targetRole) {
        // Get users with specific role
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profiles } = await (supabase as any)
            .from("profiles")
            .select("id")
            .eq("role", targetRole);

        if (profiles && profiles.length > 0) {
            const userIds = profiles.map((p: any) => p.id);
            const { data } = await query.in("user_id", userIds);
            subscriptions = data || [];
        }
    } else {
        const { data } = await query;
        subscriptions = data || [];
    }

    // Log the notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("notifications").insert({
        title,
        body,
        target_role: targetRole || null,
        sent_by: user?.id,
    });

    // Send to all subscriptions
    const payload = JSON.stringify({ title, body, url: "/" });
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                payload
            );
            sent++;
        } catch (err: any) {
            failed++;
            if (err.statusCode === 410 || err.statusCode === 404) {
                await removePushSubscription(sub.endpoint);
            }
        }
    }

    return { sent, failed, total: subscriptions.length };
}

// Get notifications for current user (for the bell dropdown)
export async function getNotificationsForUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user profile to check role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userRole = profile?.role || "ortu";

    // Fetch notifications targeted to this user's role or all users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notifications, error } = await (supabase as any)
        .from("notifications")
        .select("id, title, body, target_role, created_at")
        .or(`target_role.is.null,target_role.eq.${userRole}`)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    return (notifications || []).map((n: any) => ({
        id: n.id,
        type: "info" as const,
        title: n.title,
        message: n.body,
        time: formatRelativeTime(n.created_at),
        read: false, // TODO: track read status per user
    }));
}

// Helper function to format relative time
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID");
}

// Get VAPID public key for client
export async function getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
}
