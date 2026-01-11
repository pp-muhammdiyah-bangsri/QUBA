import { getKegiatanList, getSantriForPresensi, getMyGroups, generateDailySchedules, getUserRole } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getKelasDropdown, getHalaqohDropdown } from "../data-master/actions";
import { PresensiPage as PresensiContent } from "./presensi-page";
import { AttendanceReminderChecker } from "@/components/attendance-reminder";

export default async function PresensiPage() {
    // 1. Lazy generate routines
    await generateDailySchedules();

    // 2. Fetch data
    const [kegiatanList, santriList, kelasList, halaqohList, myGroups, userRole] = await Promise.all([
        getKegiatanList(),
        getSantriForPresensi(),
        getKelasDropdown(),
        getHalaqohDropdown(),
        getMyGroups(),
        getUserRole(),
    ]);

    const today = new Date();
    const todayString = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(today);
    const dayName = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long"
    }).format(today);

    return (
        <div className="space-y-6">
            {/* Diagnostic Banner */}
            <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Info Server Time</AlertTitle>
                <AlertDescription className="text-blue-600">
                    Sistem mendeteksi hari ini: <strong>{dayName}, {todayString}</strong> (Asia/Jakarta).
                    Pastikan Jadwal Rutin Anda aktif untuk hari ini.
                </AlertDescription>
            </Alert>

            {/* Attendance Reminder Checker (runs on load for Ustadz) */}
            <AttendanceReminderChecker />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Presensi</h1>
                <p className="text-gray-500 mt-1">
                    Kelola kegiatan dan input presensi santri
                </p>
            </div>
            <PresensiContent
                initialKegiatan={kegiatanList}
                santriList={santriList}
                kelasList={kelasList}
                halaqohList={halaqohList}
                myGroups={myGroups}
                userRole={userRole || "user"}
            />
        </div>
    );
}
