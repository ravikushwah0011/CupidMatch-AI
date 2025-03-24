
import { Switch } from "@/components/ui/switch";

export default function PrivacyTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Privacy Settings</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Profile Visibility</h3>
            <p className="text-sm text-neutral-500">Control who can see your profile</p>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Location Sharing</h3>
            <p className="text-sm text-neutral-500">Share your location with matches</p>
          </div>
          <Switch />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Activity Status</h3>
            <p className="text-sm text-neutral-500">Show when you're online</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
