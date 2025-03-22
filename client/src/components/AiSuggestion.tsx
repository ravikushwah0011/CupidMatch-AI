import { ReactNode } from "react";

interface AiSuggestionProps {
  title: string;
  children: ReactNode;
  type?: "default" | "accent" | "secondary";
  icon?: "robot" | "lightbulb" | "magic" | "star";
  className?: string;
}

export default function AiSuggestion({ 
  title, 
  children, 
  type = "default",
  icon = "robot",
  className = ""
}: AiSuggestionProps) {
  const getTypeClasses = () => {
    switch(type) {
      case "accent":
        return "bg-accent bg-opacity-5";
      case "secondary":
        return "bg-secondary bg-opacity-5";
      default:
        return "bg-neutral-100";
    }
  };
  
  const getIconClasses = () => {
    switch(type) {
      case "accent":
        return "text-accent";
      case "secondary":
        return "text-secondary";
      default:
        return "text-neutral-600";
    }
  };
  
  const getIconElement = () => {
    switch(icon) {
      case "lightbulb":
        return <i className={`fas fa-lightbulb ${getIconClasses()} mr-2`}></i>;
      case "magic":
        return <i className={`fas fa-magic ${getIconClasses()} mr-2`}></i>;
      case "star":
        return <i className={`fas fa-star ${getIconClasses()} mr-2`}></i>;
      default:
        return <i className={`fas fa-robot ${getIconClasses()} mr-2`}></i>;
    }
  };
  
  return (
    <div className={`${getTypeClasses()} rounded-lg p-3 mb-4 ${className} slide-in`}>
      <div className="flex items-center mb-2">
        {getIconElement()}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="text-sm text-neutral-700">
        {children}
      </div>
    </div>
  );
}
