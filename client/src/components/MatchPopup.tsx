import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AiSuggestion from "./AiSuggestion";

interface MatchPopupProps {
  matchId: number;
  userId: number;
  matchedUserId: number;
  onClose: () => void;
}

export default function MatchPopup({ 
  matchId, 
  userId, 
  matchedUserId,
  onClose
}: MatchPopupProps) {
  const [, navigate] = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [matchedUserImage, setMatchedUserImage] = useState<string | null>(null);
  
  // Fetch matched user data
  const { data: matchedUser } = useQuery({
    queryKey: [`/api/users/${matchedUserId}`],
  });
  
  // Fetch conversation starters
  const { data: conversationStarters } = useQuery({
    queryKey: [`/api/matches/${matchId}/conversation-starters`],
    enabled: !!matchId,
  });
  
  // In a real app, would fetch actual user images
  useEffect(() => {
    setProfileImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80");
    setMatchedUserImage("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80");
  }, []);
  
  const handleStartChat = () => {
    navigate(`/chat/${matchId}`);
    onClose();
  };
  
  const handleKeepBrowsing = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full match-animation m-4">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🎉</div>
          <h2 className="text-2xl font-semibold font-poppins mb-2">It's a Match!</h2>
          <p className="text-neutral-600">
            You and {matchedUser?.profileName || 'your match'} have liked each other
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="relative flex">
            {profileImage && (
              <img 
                src={profileImage} 
                alt="Your profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-white -mr-4 z-10" 
              />
            )}
            {matchedUserImage && (
              <img 
                src={matchedUserImage} 
                alt="Match profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-white -ml-4" 
              />
            )}
          </div>
        </div>
        
        {conversationStarters && conversationStarters.starters && (
          <AiSuggestion 
            title="Conversation Starters" 
            type="accent"
          >
            <div className="space-y-2">
              {conversationStarters.starters.map((starter: string, index: number) => (
                <button 
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-3 text-sm w-full text-left hover:bg-neutral-50"
                  onClick={handleStartChat}
                >
                  {starter}
                </button>
              ))}
            </div>
          </AiSuggestion>
        )}
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 py-3 rounded-full font-montserrat"
            onClick={handleKeepBrowsing}
          >
            Keep Browsing
          </Button>
          <Button 
            className="flex-1 bg-primary text-white py-3 rounded-full font-montserrat shadow-button"
            onClick={handleStartChat}
          >
            Message Now
          </Button>
        </div>
      </div>
    </div>
  );
}
