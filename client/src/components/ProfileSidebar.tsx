import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faLock,
  faQuestionCircle,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useUser } from "@/context/UserContext";
import tabManager from "@/lib/tabManager";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: string) => void;
}

export default function ProfileSidebar({
  isOpen,
  onClose,
  onTabChange,
}: ProfileSidebarProps) {
  const { logout } = useUser();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={`fixed top-[64px] right-0 bottom-0 w-20 md:w-64 bg-sidebar border-l shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      ref={sidebarRef}
    >
      <div className="p-4 space-y-4">
        <button
          className="w-full p-3 flex items-center text-left hover:bg-neutral-100 rounded-lg"
          onClick={() => {
            tabManager.setActiveTab("profile");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faUser} className="mr-3" />
          Profile
        </button>
        <button
          className="w-full p-3 flex items-center text-left hover:bg-neutral-100 rounded-lg"
          onClick={() => {
            tabManager.setActiveTab("settings");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faCog} className="mr-3" />
          Settings
        </button>

        <button
          className="w-full p-3 flex items-center text-left hover:bg-neutral-100 rounded-lg"
          onClick={() => {
            // onTabChange("privacy");
            tabManager.setActiveTab("privacy");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faLock} className="mr-3" />
          Privacy
        </button>

        <button
          className="w-full p-3 flex items-center text-left hover:bg-neutral-100 rounded-lg"
          onClick={() => {
            // onTabChange("help");
            tabManager.setActiveTab("help");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-3" />
          Help
        </button>

        <hr className="my-4" />

        <button
          className="w-full p-3 flex items-center text-left text-red-600 hover:bg-red-50 rounded-lg"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
