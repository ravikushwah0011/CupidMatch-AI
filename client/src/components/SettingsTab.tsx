
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/context/UserContext";

export default function SettingsTab() {
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Appearance</h3>
            <p className="text-sm text-neutral-500">Dark mode and theme options</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Change Password</h3>
            <p className="text-sm text-neutral-500">Update your password</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>
      </div>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
        Logout
      </Button>
    </div>
  );
}
