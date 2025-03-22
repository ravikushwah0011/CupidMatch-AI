import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useVideoCall } from "@/hooks/useVideoCall";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface Match {
  id: number;
  userId1: number;
  userId2: number;
  status: string;
  otherUser: {
    id: number;
    profileName: string;
  };
}

export default function VideoCall() {
  const { matchId } = useParams<{ matchId: string }>();
  const numericMatchId = parseInt(matchId);
  const [, navigate] = useLocation();
  const { user } = useUser();
  const videoCallTimer = useRef<NodeJS.Timeout | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showConversationStarters, setShowConversationStarters] = useState(true);
  
  // Video call hooks
  const {
    localStream,
    remoteStream,
    callStatus,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled
  } = useVideoCall();
  
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
  
  // Fetch video date tips
  const { data: videoDateTips } = useQuery({
    queryKey: [`/api/matches/${numericMatchId}/video-date-tips`],
    enabled: !!numericMatchId && showConversationStarters,
  });
  
  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async () => {
      // In a real app, would update a video call record in the database
      return apiRequest('PATCH', `/api/video-calls/${numericMatchId}`, { 
        status: 'completed',
        duration: callDuration
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${numericMatchId}/video-calls`] });
      navigate('/matches');
    },
  });
  
  // Start call when component mounts
  useEffect(() => {
    if (match && user) {
      // Determine the other user ID
      const otherUserId = match.userId1 === user.id ? match.userId2 : match.userId1;
      startCall(otherUserId);
      
      // Start timer for call duration
      videoCallTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    // Clean up on unmount
    return () => {
      if (videoCallTimer.current) {
        clearInterval(videoCallTimer.current);
      }
      endCall();
    };
  }, [match, user]);
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleEndCall = () => {
    if (videoCallTimer.current) {
      clearInterval(videoCallTimer.current);
    }
    endCall();
    endCallMutation.mutate();
  };
  
  const toggleConversationStarters = () => {
    setShowConversationStarters(prev => !prev);
  };
  
  if (isLoadingMatch || !user) {
    return (
      <div className="fixed inset-0 bg-neutral-900 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="fixed inset-0 bg-neutral-900 z-50 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Match not found</h2>
        <p className="text-white text-opacity-80 mb-4">This call session doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/matches')}>Back to Matches</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neutral-900 z-50 max-w-md mx-auto">
      <div className="relative h-full w-full">
        {/* Main video (other person) */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              autoPlay
              playsInline
              ref={(videoElement) => {
                if (videoElement && remoteStream) {
                  videoElement.srcObject = remoteStream;
                }
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
              <div className="text-center text-white text-opacity-70">
                {callStatus === 'connecting' ? (
                  <>
                    <div className="animate-pulse text-4xl mb-4">🔄</div>
                    <p>Connecting to {match.otherUser.profileName}...</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">👤</div>
                    <p>Waiting for video...</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Self video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white">
          {localStream ? (
            <video
              autoPlay
              playsInline
              muted
              ref={(videoElement) => {
                if (videoElement && localStream) {
                  videoElement.srcObject = localStream;
                }
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
              <p className="text-white text-opacity-50">Loading camera...</p>
            </div>
          )}
        </div>
        
        {/* Call information */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
          <p>{match.otherUser.profileName} • {formatDuration(callDuration)}</p>
        </div>
        
        {/* AI conversation starters */}
        {showConversationStarters && videoDateTips && videoDateTips.tips && (
          <div className="absolute bottom-24 left-4 right-4">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3 slide-in">
              <div className="flex items-center mb-2">
                <i className="fas fa-robot text-accent mr-2"></i>
                <h4 className="text-xs font-semibold text-white">Conversation Starters</h4>
              </div>
              <div className="flex overflow-x-auto pb-2 gap-2">
                {videoDateTips.tips.map((tip: string, index: number) => (
                  <button 
                    key={index}
                    className="bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm whitespace-nowrap"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Call controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center">
          <div className="flex gap-4">
            <button 
              className={`w-12 h-12 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white bg-opacity-10 backdrop-blur-sm'} flex items-center justify-center text-white`}
              onClick={toggleMute}
            >
              <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </button>
            <button 
              className={`w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white`}
              onClick={toggleVideo}
            >
              <i className={`fas ${isVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white"
              onClick={handleEndCall}
            >
              <i className="fas fa-phone-slash"></i>
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white"
              onClick={toggleConversationStarters}
            >
              <i className={`fas ${showConversationStarters ? 'fa-lightbulb' : 'fa-lightbulb'}`}></i>
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
