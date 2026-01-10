"use server";

import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

// VAPID configuration
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@quba.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
}

// Helper to send notification to a user
async function sendToUser(userId: string, payload: NotificationPayload) {
    console.log(`[Push] Attempting to send to user ${userId}`);
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.error("[Push] VAPID keys missing");
        return { sent: 0 };
    }

    // Use service client to bypass RLS so we can read ANY user's subscription
    // (Action triggered by Ustadz needs to read Parent's subscription)
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptions } = await (supabase as any)
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
        console.warn(`[Push] No subscriptions found for user ${userId}`);
        return { sent: 0 };
    }

    console.log(`[Push] Found ${subscriptions.length} subscriptions for user ${userId}`);

    const payloadStr = JSON.stringify(payload);
    let sent = 0;

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payloadStr
            );
            console.log(`[Push] Notification sent to endpoint ending in ${sub.endpoint.slice(-5)}`);
            sent++;
        } catch (err) {
            console.error("[Push] Failed to send to endpoint", sub.endpoint.slice(-20), err);
        }
    }

    console.log(`[Push] Total sent: ${sent}/${subscriptions.length}`);
    return { sent };
}

// Helper to save notification to database for in-app bell display
async function saveToNotificationsTable(title: string, body: string, targetRole?: string, targetSantriId?: string) {
    try {
        // Use service client to bypass RLS
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = createServiceClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("notifications")
            .insert({
                title,
                body,
                target_role: targetRole || null,
                target_santri_id: targetSantriId || null,
            });

        if (error) {
            console.error("Error inserting notification:", error.message);
        } else {
            console.log("Notification saved to database:", title);
        }
    } catch (error) {
        console.error("Error saving notification to database:", error);
    }
}

// ========== PARENT NOTIFICATIONS ==========

/**
 * Notify parent when their child completes a Juz memorization
 */
export async function notifyParentHafalanSelesai(santriId: string, juz: number) {
    const supabase = await createClient();

    // Get santri name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // Find parent user (linked_santri_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    const title = "🎉 Hafalan Selesai!";
    const body = `${santri?.nama || "Anak Anda"} telah menyelesaikan hafalan Juz ${juz}`;
    const url = "/akademik/progres";

    // Save to notifications table for in-app display (with santri-specific targeting)
    await saveToNotificationsTable(title, body, "ortu", santriId);

    if (!parentProfile) {
        console.warn(`[Push] No parent profile found for santri ${santriId}`);
        return { sent: 0 };
    }

    console.log(`[Push] Found parent ${parentProfile.id}`);
    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify parent when hafalan lembar is recorded for their child
 */
export async function notifyParentHafalanLembar(santriId: string, juz: number, lembar: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    const title = "📖 Hafalan Baru";
    const body = `${santri?.nama || "Anak Anda"} telah menyelesaikan Juz ${juz} Lembar ${lembar}`;
    const url = "/akademik/lembar";

    // Save to notifications table for in-app display (with santri-specific targeting)
    await saveToNotificationsTable(title, body, "ortu", santriId);

    if (!parentProfile) return { sent: 0 };

    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify parent when tasmi is recorded for their child
 */
export async function notifyParentHafalanTasmi(santriId: string, juz: number, predikat: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    const title = "🎤 Hasil Tasmi'";
    const body = `${santri?.nama || "Anak Anda"} Tasmi' Juz ${juz}: ${predikat}`;
    const url = "/akademik/tasmi";

    // Save to notifications table for in-app display (with santri-specific targeting)
    await saveToNotificationsTable(title, body, "ortu", santriId);

    if (!parentProfile) return { sent: 0 };

    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify parent when a violation is recorded for their child
 */
export async function notifyParentPelanggaran(santriId: string, deskripsi: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    const title = "⚠️ Catatan Pelanggaran";
    const body = `${santri?.nama || "Anak Anda"}: ${deskripsi.substring(0, 50)}...`;
    const url = "/kesantrian/pelanggaran";

    // Save to notifications table for in-app display (with santri-specific targeting)
    await saveToNotificationsTable(title, body, "ortu", santriId);

    if (!parentProfile) return { sent: 0 };

    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify parent when leave request status changes
 */
export async function notifyParentPerizinan(santriId: string, status: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    if (!parentProfile) return { sent: 0 };

    const statusText = status === "approved" ? "Disetujui ✅" : status === "rejected" ? "Ditolak ❌" : "Pending";
    const title = "📋 Update Perizinan";
    const body = `Perizinan ${santri?.nama || "Anak Anda"}: ${statusText}`;
    const url = "/kesantrian/perizinan";

    // Save to notifications table for in-app display (with santri-specific targeting)
    await saveToNotificationsTable(title, body, "ortu", santriId);

    if (!parentProfile) return { sent: 0 };

    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify parent when presensi is recorded
 */
export async function notifyParentPresensi(santriId: string, kegiatanName: string, status: string) {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: santri } = await (supabase as any)
        .from("santri")
        .select("nama")
        .eq("id", santriId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parentProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("linked_santri_id", santriId)
        .eq("role", "ortu")
        .single();

    if (!parentProfile) return { sent: 0 };

    const statusMap: Record<string, string> = {
        hadir: "Hadir ✅",
        izin: "Izin 📩",
        sakit: "Sakit 💊",
        alpa: "Alpa ❌",
    };

    const statusText = statusMap[status.toLowerCase()] || status;
    const title = "📝 Laporan Presensi";
    const body = `${santri?.nama || "Anak Anda"} - ${kegiatanName}: ${statusText}`;
    const url = "/presensi/riwayat"; // Or redirect to specific page

    // Save to notifications table
    await saveToNotificationsTable(title, body, "ortu", santriId);

    return sendToUser(parentProfile.id, { title, body, url });
}

/**
 * Notify all parents about a new event
 */
export async function notifyAllParentsEvent(eventName: string, eventDate: string) {
    const supabase = await createClient();

    // Get all parent users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parents } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("role", "ortu");

    const title = "📅 Event Baru";
    const body = `${eventName} - ${eventDate}`;
    const url = "/event";

    // Save to notifications table for in-app display (global event for all parents)
    await saveToNotificationsTable(title, body, "ortu");

    if (!parents || parents.length === 0) return { sent: 0 };

    let totalSent = 0;
    for (const parent of parents) {
        const result = await sendToUser(parent.id, { title, body, url });
        totalSent += result.sent;
    }

    return { sent: totalSent };
}

// ========== USTADZ NOTIFICATIONS ==========

/**
 * Check and notify Ustadz about upcoming attendance that needs to be filled
 * Call this when Ustadz opens the presensi page
 */
export async function checkAndNotifyUstadzReminder(userId: string) {
    const supabase = await createClient();

    // Get current time in Jakarta
    const now = new Date();
    const jakartaOffset = 7 * 60; // UTC+7
    const jakartaTime = new Date(now.getTime() + (jakartaOffset + now.getTimezoneOffset()) * 60000);

    // Find ustadz's groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ustadz } = await (supabase as any)
        .from("asatidz")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (!ustadz) return { reminders: [] };

    // Get today's kegiatan that's starting within 15 minutes
    const today = jakartaTime.toISOString().split("T")[0];
    const currentHour = jakartaTime.getHours();
    const currentMinute = jakartaTime.getMinutes();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kegiatan } = await (supabase as any)
        .from("kegiatan")
        .select("id, nama, jam_mulai")
        .eq("tanggal_mulai", today)
        .not("jam_mulai", "is", null);

    if (!kegiatan || kegiatan.length === 0) return { reminders: [] };

    const reminders: string[] = [];

    for (const k of kegiatan) {
        if (!k.jam_mulai) continue;

        const [hour, minute] = k.jam_mulai.split(":").map(Number);
        const kegiatanMinutes = hour * 60 + minute;
        const currentMinutes = currentHour * 60 + currentMinute;

        // Check if kegiatan is within 15 minutes from now
        const diff = kegiatanMinutes - currentMinutes;
        if (diff > 0 && diff <= 15) {
            // Check if presensi already filled
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { count } = await (supabase as any)
                .from("presensi")
                .select("*", { count: "exact", head: true })
                .eq("kegiatan_id", k.id);

            if (count === 0) {
                reminders.push(k.nama);

                // Send notification
                await sendToUser(userId, {
                    title: "⏰ Reminder Presensi",
                    body: `${k.nama} dimulai dalam ${diff} menit. Jangan lupa isi presensi!`,
                    url: "/presensi",
                });
            }
        }
    }

    return { reminders };
}

/**
 * Notify specific Ustadz about attendance reminder
 */
export async function notifyUstadzPresensiReminder(ustadzUserId: string, kegiatanName: string, minutesLeft: number) {
    return sendToUser(ustadzUserId, {
        title: "⏰ Reminder Presensi",
        body: `${kegiatanName} dimulai dalam ${minutesLeft} menit. Isi presensi sekarang!`,
        url: "/presensi",
    });
}
