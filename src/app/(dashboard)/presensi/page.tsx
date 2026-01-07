import { getKegiatanList, getSantriForPresensi, getMyGroups, generateDailySchedules, getUserRole } from "./actions";
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

    return (
        <div className="space-y-6">
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
