
import { generateDailySchedules } from "./src/app/(dashboard)/presensi/actions";

async function main() {
    console.log("Running generateDailySchedules...");
    await generateDailySchedules();
    console.log("Done.");
}

main().catch(console.error);
