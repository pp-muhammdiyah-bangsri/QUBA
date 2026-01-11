
import { createAdminClient } from "./src/lib/supabase/server";

async function main() {
    const supabase = await createAdminClient();

    console.log("Checking Kelas Schema...");
    const { data: kelas } = await supabase.from("kelas").select("*").limit(1);
    console.log("Kelas keys:", Object.keys(kelas?.[0] || {}));

    console.log("Checking Halaqoh Schema...");
    const { data: halaqoh } = await supabase.from("halaqoh").select("*").limit(1);
    console.log("Halaqoh keys:", Object.keys(halaqoh?.[0] || {}));
}

main().catch(console.error);
