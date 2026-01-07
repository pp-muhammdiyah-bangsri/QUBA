"use client";

import { useEffect, useState } from "react";
import { checkAndNotifyUstadzReminder } from "@/lib/notifications/auto-notify";
import { createClient } from "@/lib/supabase/client";

/**
 * This component runs on presensi page load for Ustadz.
 * It checks if there are upcoming kegiatan without presensi and sends reminders.
 */
export function AttendanceReminderChecker() {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) return;

        const checkReminders = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Get user role
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await (supabase as any)
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            // Only check for ustadz
            if (profile?.role === "ustadz") {
                await checkAndNotifyUstadzReminder(user.id);
            }

            setChecked(true);
        };

        checkReminders().catch(console.error);
    }, [checked]);

    return null; // This component doesn't render anything
}
