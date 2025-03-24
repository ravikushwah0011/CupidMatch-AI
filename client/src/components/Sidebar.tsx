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
    <div className="fixed top-[64px] bottom-0 w-20 md:w-64 bg-sidebar border-r border-neutral-200 p-4">
      <div className="flex flex-col gap-4">
        <Link href="/">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faHome}
              className="text-xl text-green-500 md:mr-2"
            />
            <span className="hidden md:inline">Discover</span>
          </a>
        </Link>
        <Link href="/matches">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-xl text-primary md:mr-2"
            />
            <span className="hidden md:inline">Matches</span>
          </a>
        </Link>
        <Link href="/messages">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faComment}
              className="text-xl text-blue-500 md:mr-2"
            />
            <span className="hidden md:inline">Messages</span>
          </a>
        </Link>
        <Link href="/ai-assistant">
          <a className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg">
            <FontAwesomeIcon
              icon={faRobot}
              className="text-xl text-violet-500 md:mr-2"
            />
            <span className="hidden md:inline">AI Assistant</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
