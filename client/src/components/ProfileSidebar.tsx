import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
      className={`fixed top-[64px] right-0 w-20 md:w-64 bg-sidebar rounded-l-xl bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      ref={sidebarRef}
    >
      <div className="p-4 space-y-4">
        <Button
        variant={"ghost"}
          className="w-full justify-start"
          onClick={() => {
            tabManager.setActiveTab("profile");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faUser} className="mr-3" />
          Profile
        </Button>
        <Button
        variant={"ghost"}
          className="w-full justify-start"
          onClick={() => {
            tabManager.setActiveTab("settings");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faCog} className="mr-3" />
          Settings
        </Button>

        <Button
        variant={"ghost"}
          className="w-full justify-start"
          onClick={() => {
            // onTabChange("privacy");
            tabManager.setActiveTab("privacy");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faLock} className="mr-3" />
          Privacy
        </Button>

        <Button
          variant={"ghost"}
          className="w-full justify-start"
          onClick={() => {
            // onTabChange("help");
            tabManager.setActiveTab("help");
            onClose();
          }}
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-3" />
          Help
        </Button>

        <hr className="my-4" />

        <button
          className="w-full p-3 flex items-center text-left text-red-600 hover:bg-red-50 rounded-lg "
          onClick={() => {
            handleLogout();
            onClose();
          }}
          
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
