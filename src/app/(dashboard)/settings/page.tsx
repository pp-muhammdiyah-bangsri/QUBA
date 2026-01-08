import { getProfile } from "./actions";
import { SettingsPage } from "./settings-page";

export default async function Settings() {
    const profile = await getProfile();

    if ("error" in profile) {
        return <div>Error loading profile</div>;
    }

    return <SettingsPage initialProfile={profile} />;
}
