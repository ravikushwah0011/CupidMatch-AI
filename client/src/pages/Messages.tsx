import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";

interface Match {
  id: number;
  status: string;
  timestamp: string;
  otherUser: {
    id: number;
    profileName: string;
    profileVideoUrl?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    isFromOtherUser: boolean;
  };
}

export default function Messages() {
  const [, navigate] = useLocation();
  
  // Only get matches with status "matched"
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['/api/matches'],
    select: (data) => data.filter(match => match.status === 'matched')
  });
  
  const handleChatClick = (matchId: number) => {
    navigate(`/chat/${matchId}`);
  };
  
  // Format time for last message
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If same day, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within a week, show day name
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-4 border-b border-neutral-200">
        <h1 className="text-xl font-semibold">Messages</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {matches.map(match => (
              <div 
                key={match.id}
                className="py-3 cursor-pointer hover:bg-neutral-50"
                onClick={() => handleChatClick(match.id)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 mr-3 relative overflow-hidden">
                    {match.otherUser.profileVideoUrl ? (
                      <video 
                        src={match.otherUser.profileVideoUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{match.otherUser.profileName}</h3>
                      {match.lastMessage && (
                        <span className="text-xs text-neutral-500">
                          {formatMessageTime(match.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 truncate">
                      {match.lastMessage ? (
                        match.lastMessage.isFromOtherUser ? match.lastMessage.content : `You: ${match.lastMessage.content}`
                      ) : (
                        <span className="text-neutral-400">No messages yet</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fas fa-comment text-4xl text-neutral-300 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-neutral-500">
              When you match with someone, you can start a conversation here
            </p>
          </div>
        )}
      </main>
      
      <Navbar />
    </div>
  );
}
