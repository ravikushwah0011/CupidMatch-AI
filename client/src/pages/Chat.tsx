import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "@/components/MessageBubble";
import AiSuggestion from "@/components/AiSuggestion";

interface Message {
  id: number;
  matchId: number;
  senderId: number;
  content: string;
  timestamp: Date;
}

interface Match {
  id: number;
  userId1: number;
  userId2: number;
  status: string;
  otherUser: {
    id: number;
    profileName: string;
    profileVideoUrl?: string;
  };
}

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const numericMatchId = parseInt(matchId);
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Fetch match details
  const { data: match, isLoading: isLoadingMatch } = useQuery<Match>({
    queryKey: [`/api/matches/${numericMatchId}`],
    enabled: !!numericMatchId,
    select: (data) => {
      if (!data || !user) return data;
      
      // Determine which user is the "other" user
      const otherUserId = data.userId1 === user.id ? data.userId2 : data.userId1;
      
      // Find the other user in the otherUser data
      return {
        ...data,
        otherUser: data.otherUser?.id === otherUserId ? data.otherUser : { id: otherUserId, profileName: "User" },
      };
    },
  });
  
  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/matches/${numericMatchId}/messages`],
    enabled: !!numericMatchId,
  });
  
  // Fetch conversation starters
  const { data: conversationStarters } = useQuery({
    queryKey: [`/api/matches/${numericMatchId}/conversation-starters`],
    enabled: !!numericMatchId && showSuggestions,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/matches/${numericMatchId}/messages`, { content });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${numericMatchId}/messages`] });
      
      // Also send via WebSocket for real-time
      if (match) {
        sendMessage('message', {
          matchId: numericMatchId,
          content: messageText
        });
      }
    },
  });
  
  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_message' && lastMessage.message) {
      // Add the new message to the query cache
      queryClient.setQueryData([`/api/matches/${numericMatchId}/messages`], (oldData: Message[] | undefined) => {
        if (!oldData) return [lastMessage.message];
        return [...oldData, lastMessage.message];
      });
    }
  }, [lastMessage, numericMatchId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    sendMessageMutation.mutate(messageText);
    setMessageText("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleUseSuggestion = (suggestion: string) => {
    sendMessageMutation.mutate(suggestion);
    setShowSuggestions(false);
  };
  
  const handleBackClick = () => {
    navigate('/messages');
  };
  
  const handleVideoClick = () => {
    navigate(`/video-schedule/${numericMatchId}`);
  };

  if (isLoadingMatch || isLoadingMessages || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Match not found</h2>
        <p className="text-neutral-600 mb-4">This conversation doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-40 max-w-md mx-auto">
      <header className="p-4 flex items-center border-b border-neutral-200">
        <button className="mr-4 text-neutral-600" onClick={handleBackClick}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex items-center">
          {match.otherUser.profileVideoUrl ? (
            <video
              src={match.otherUser.profileVideoUrl}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
              <i className="fas fa-user text-neutral-400"></i>
            </div>
          )}
          <div className="ml-3">
            <h2 className="font-semibold">{match.otherUser.profileName}</h2>
            <p className="text-xs text-neutral-500">
              {connectionStatus === 'open' ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center">
          <Button 
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-2 p-0"
            onClick={handleVideoClick}
          >
            <i className="fas fa-video"></i>
          </Button>
          <button className="text-neutral-600">
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 pb-20 h-[calc(100%-132px)]">
        {messages && messages.length > 0 ? (
          <>
            <div className="text-center text-xs text-neutral-500 mb-4">
              {new Date(messages[0].timestamp).toLocaleDateString()}
            </div>
            
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                isOutgoing={message.senderId === user.id}
                timestamp={new Date(message.timestamp)}
                senderImage={message.senderId !== user.id ? match.otherUser.profileVideoUrl : undefined}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fas fa-comment text-4xl text-neutral-300 mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-neutral-500 text-sm">
              Start the conversation with {match.otherUser.profileName}
            </p>
          </div>
        )}
        
        {showSuggestions && conversationStarters && conversationStarters.starters && (
          <AiSuggestion 
            title="AI Suggestions" 
            type="accent"
            className="slide-in"
          >
            <div className="space-y-2">
              {conversationStarters.starters.map((starter: string, index: number) => (
                <button
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-2 text-sm w-full text-left hover:bg-neutral-50"
                  onClick={() => handleUseSuggestion(starter)}
                >
                  {starter}
                </button>
              ))}
            </div>
          </AiSuggestion>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4">
        <div className="flex items-center">
          <button className="text-neutral-500 mr-3">
            <i className="fas fa-plus-circle text-xl"></i>
          </button>
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-neutral-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button
            className="ml-3 p-0 text-primary bg-transparent hover:bg-transparent"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin text-xl"></i>
            ) : (
              <i className="fas fa-paper-plane text-xl"></i>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
