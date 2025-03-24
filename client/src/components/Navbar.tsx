import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Notifications from "./Notifications";
import ProfileSidebar from "./ProfileSidebar";

interface UserProfileTab {
  id: "profile" | "settings" | "privacy" | "help";
  label: string;
  // icon: IconDefinition;
}

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user } = useUser();
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  const tabs: UserProfileTab[] = [
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
    { id: "privacy", label: "Privacy" },
    { id: "help", label: "Help" },
  ];

  const isProfileCreation =
    location === "/profile-creation" || location === "/profile-preview";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 py-3 px-6 z-20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-xl font-bold text-primary">MatchAI</a>
          </Link>
          {user && !isProfileCreation && (
            <Link href="/">
              <a className="text-gray-600 hover:text-gray-800">
                <FontAwesomeIcon icon={faHome} className="text-xl" />
              </a>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user && !isProfileCreation && (
            <>
              <Link href="/login">
                <a className="text-gray-600 hover:text-gray-800">Login</a>
              </Link>
              <Link href="/signup">
                <a className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                  Sign Up
                </a>
              </Link>
            </>
          )}

          {!user && isProfileCreation && (
            <Link href="/login">
              <a className="text-gray-600 hover:text-gray-800">Login</a>
            </Link>
          )}

          {user && !isProfileCreation && (
            <>
              <Notifications />
              <button
                onClick={() => {
                  setIsProfileSidebarOpen(!isProfileSidebarOpen);
                  navigate("/profile");
                }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            </>
          )}
        </div>
      </div>

      {isProfileSidebarOpen && (
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={() => setIsProfileSidebarOpen(false)}
          onTabChange={(tab) => {
            setIsProfileSidebarOpen(false);
          }}
        />
      )}
    </nav>
  );
}
