
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { user, updateProfile } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showLocation: true,
    showAge: true
  });

  const handlePrivacyUpdate = async (key: string, value: any) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    await updateProfile({ privacySettings: newPrivacy });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Profile Visibility</label>
            <select 
              value={privacy.profileVisibility}
              onChange={(e) => handlePrivacyUpdate("profileVisibility", e.target.value)}
              className="border rounded p-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label>Show Location</label>
            <Switch 
              checked={privacy.showLocation}
              onCheckedChange={(checked) => handlePrivacyUpdate("showLocation", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label>Show Age</label>
            <Switch 
              checked={privacy.showAge}
              onCheckedChange={(checked) => handlePrivacyUpdate("showAge", checked)}
            />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="flex items-center justify-between">
          <label>Enable Notifications</label>
          <Switch 
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </section>

      <Button onClick={() => updateProfile({ notifications, privacySettings: privacy })}>
        Save Changes
      </Button>
    </div>
  );
}
