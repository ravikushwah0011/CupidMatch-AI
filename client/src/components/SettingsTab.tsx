import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/context/UserContext";

export default function SettingsTab() {
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {/* Header */}
      {/* <header className="p-4 flex items-center justify-between border-b border-neutral-200">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
              Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSaveProfile}>
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Save
            </Button>
          )}
        </div>
      </header> */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">Appearance</h3>
              <p className="text-sm text-neutral-500">
                Dark mode and theme options
              </p>
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400"
            />
          </div>

          <div className="p-4 flex justify-between items-center border-t">
            <div>
              <h3 className="font-medium">Change Password</h3>
              <p className="text-sm text-neutral-500">Update your password</p>
            </div>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400"
            />
          </div>
        </div>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
