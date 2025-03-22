import { forwardRef } from "react";

interface MessageBubbleProps {
  content: string;
  isOutgoing: boolean;
  timestamp?: Date;
  senderImage?: string;
}

const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(({
  content,
  isOutgoing,
  timestamp,
  senderImage
}, ref) => {
  const formatTime = (date?: Date) => {
    if (!date) return "";
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  if (isOutgoing) {
    return (
      <div ref={ref} className="sent-message mb-4 flex justify-end">
        <div className="message-bubble-sent bg-primary text-white p-3 max-w-[80%] relative">
          <p>{content}</p>
          {timestamp && (
            <span className="text-xs text-white text-opacity-70 absolute bottom-1 right-2">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div ref={ref} className="received-message mb-4 flex">
      {senderImage && (
        <img 
          src={senderImage} 
          alt="Contact profile" 
          className="w-8 h-8 rounded-full object-cover mr-2 self-end" 
        />
      )}
      <div className="message-bubble-received bg-neutral-100 p-3 max-w-[80%] relative">
        <p>{content}</p>
        {timestamp && (
          <span className="text-xs text-neutral-500 absolute bottom-1 right-2">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
