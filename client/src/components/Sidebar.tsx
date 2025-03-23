
import { Link } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faHeart, faComment, faRobot } from "@fortawesome/free-solid-svg-icons";

export function Sidebar() {
  return (
    <div className="fixed right-0 top-[72px] bottom-0 w-64 bg-white border-l border-neutral-200 p-4">
      <div className="flex flex-col gap-4">
        <Link href="/">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faHome} className="text-xl" />
            <span>Discover</span>
          </a>
        </Link>
        <Link href="/matches">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faHeart} className="text-xl" />
            <span>Matches</span>
          </a>
        </Link>
        <Link href="/messages">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faComment} className="text-xl" />
            <span>Messages</span>
          </a>
        </Link>
        <Link href="/ai-assistant">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faRobot} className="text-xl" />
            <span>AI Assistant</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
