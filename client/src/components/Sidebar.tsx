import { Link } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faHeart,
  faComment,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  return (
    <div className="fixed top-[72px] bottom-0 w-64 bg-white border-l border-neutral-200 p-4">
      <div className="flex flex-col gap-4">
        <Link href="/">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faHome} className="text-xl text-green-500" />
            <span>Discover</span>
          </a>
        </Link>
        <Link href="/matches">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon icon={faHeart} className="text-xl text-primary" />
            <span>Matches</span>
          </a>
        </Link>
        <Link href="/messages">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faComment}
              className="text-xl text-blue-500"
            />
            <span>Messages</span>
          </a>
        </Link>
        <Link href="/ai-assistant">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faRobot}
              className="text-xl text-violet-500"
            />
            <span>AI Assistant</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
