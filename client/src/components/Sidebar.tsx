import { Link } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faHeart,
  faComment,
  faRobot,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/button";

interface SidebarProps {
  activeTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({
  activeTab,
  setCurrentTab,
}: SidebarProps)
 {
  return (
    <div className="w-20 md:w-64 bg-sidebar border-r border-neutral-200 p-4">
      <div className="flex flex-col gap-4">
      <Button
            variant={activeTab === "discover" ? "secondary" : "link"}
            className="w-full justify-start"
            onClick={() => setCurrentTab("discover")}
          >
            <FontAwesomeIcon
              icon={faSearch}
              className="text-xl text-primary md:mr-2"
            />
            <span className="hidden md:inline">Discover</span>
          </Button>
        <Button
            variant={activeTab === "matches" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentTab("matches")}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className="text-xl text-primary md:mr-2"
            />
            <span className="hidden md:inline">Matches</span>
          </Button>
        
          <Button
            variant={activeTab === "messages" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentTab("messages")}
          >
            <FontAwesomeIcon
              icon={faComment}
              className="text-xl text-blue-500 md:mr-2"
            />
            <span className="hidden md:inline">Messages</span>
          </Button>
          <Button
            variant={activeTab === "ai-assistant" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentTab("ai-assistant")}
          >
            <FontAwesomeIcon
              icon={faRobot}
              className="text-xl text-violet-500 md:mr-2"
            />
            <span className="hidden md:inline">AI Assistant</span>
          </Button>
      </div>
    </div>
  );
}
