import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faHeart,
  faComment,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useUser();

  // Don't show navbar on certain pages
  if (
    ["/onboarding", "/profile-creation", "/profile-preview"].includes(location)
  ) {
    return null;
  }

  // Don't show navbar on video call
  if (location.startsWith("/video-call/")) {
    return null;
  }

  // Don't show navbar on authentication pages if user is not logged in
  if (
    !user &&
    (location === "/" || location === "/login" || location === "/register")
  ) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/matches" && location === "/matches") return true;
    if (
      (path === "/messages" && location.startsWith("/messages")) ||
      location.startsWith("/chat/")
    )
      return true;
    if (path === "/profile" && location === "/profile") return true;
    return false;
  };

  return (
    <nav className="fixed left-0 right-0 bg-white border-t border-neutral-200 py-3 px-6 z-10 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <Link href="/">
          <a
            className={`flex flex-col items-center ${isActive("/") ? "text-primary" : "text-neutral-400"}`}
          >
            <FontAwesomeIcon icon={faHome} className="text-xl" />
            <span className="text-xs mt-1">Discover</span>
          </a>
        </Link>

        <Link href="/matches">
          <a
            className={`flex flex-col items-center ${isActive("/matches") ? "text-primary" : "text-neutral-400"}`}
          >
            <FontAwesomeIcon icon={faHeart} className="text-xl" />
            <span className="text-xs mt-1">Matches</span>
          </a>
        </Link>

        <Link href="/messages">
          <a
            className={`flex flex-col items-center ${isActive("/messages") ? "text-primary" : "text-neutral-400"}`}
          >
            <FontAwesomeIcon icon={faComment} className="text-xl" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>

        <Link href="/profile">
          <a
            className={`flex flex-col items-center ${isActive("/profile") ? "text-primary" : "text-neutral-400"}`}
          >
            <FontAwesomeIcon icon={faUser} className="text-xl" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
