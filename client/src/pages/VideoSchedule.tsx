import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AiSuggestion from "@/components/AiSuggestion";
import { useToast } from "@/hooks/use-toast";

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

interface OptimalTime {
  day: string;
  time: string;
  confidence: number;
}

export default function VideoSchedule() {
  const { matchId } = useParams<{ matchId: string }>();
  const numericMatchId = parseInt(matchId);
  const [, navigate] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedOptimalTime, setSelectedOptimalTime] = useState<OptimalTime | null>(null);
  
  // Get tomorrow's date as default
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);
  
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
  
  // Fetch optimal times
  const { data: optimalTimes } = useQuery({
    queryKey: ['/api/optimal-times'],
    enabled: !!numericMatchId,
  });
  
  // Fetch video date tips
  const { data: videoDateTips } = useQuery({
    queryKey: [`/api/matches/${numericMatchId}/video-date-tips`],
    enabled: !!numericMatchId,
  });
  
  // Schedule video call mutation
  const scheduleVideoCallMutation = useMutation({
    mutationFn: async () => {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`);
      
      return apiRequest('POST', `/api/matches/${numericMatchId}/video-calls`, {
        scheduledTime: scheduledTime.toISOString(),
        status: "scheduled"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${numericMatchId}/video-calls`] });
      toast({
        title: "Video date scheduled",
        description: "Your invitation has been sent successfully",
      });
      navigate(`/chat/${numericMatchId}`);
    },
    onError: (error) => {
      toast({
        title: "Scheduling failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const handleBackClick = () => {
    navigate(`/chat/${numericMatchId}`);
  };
  
  const handleOptimalTimeSelect = (time: OptimalTime) => {
    setSelectedOptimalTime(time);
    
    // Parse day and time
    const days = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    const today = new Date();
    const dayDiff = (days[time.day as keyof typeof days] - today.getDay() + 7) % 7;
    
    // Calculate the next occurrence of that day
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + dayDiff);
    
    // Format date as YYYY-MM-DD
    const formattedDate = targetDate.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    
    // Format time as HH:MM
    const timeParts = time.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = timeParts[2];
      const period = timeParts[3].toUpperCase();
      
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      setSelectedTime(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }
  };
  
  const handleScheduleCall = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select both a date and time",
        variant: "destructive",
      });
      return;
    }
    
    scheduleVideoCallMutation.mutate();
  };
  
  if (isLoadingMatch || !user) {
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
        <p className="text-neutral-600 mb-4">This match doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/matches')}>Back to Matches</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-40 max-w-md mx-auto">
      <header className="p-4 flex items-center border-b border-neutral-200">
        <button className="mr-4 text-neutral-600" onClick={handleBackClick}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="font-semibold">Schedule Video Date</h2>
      </header>
      
      <div className="p-4 overflow-y-auto h-[calc(100%-132px)]">
        <div className="flex items-center mb-6">
          {match.otherUser.profileVideoUrl ? (
            <video 
              src={match.otherUser.profileVideoUrl}
              className="w-14 h-14 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
              <i className="fas fa-user text-neutral-400"></i>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Video Date with {match.otherUser.profileName}</h3>
            <p className="text-neutral-600 text-sm">Select a time that works for both of you</p>
          </div>
        </div>
        
        {optimalTimes && optimalTimes.times && (
          <div className="ai-suggested-times bg-accent bg-opacity-5 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <i className="fas fa-robot text-accent mr-2"></i>
              <h4 className="font-semibold">AI-Suggested Best Times</h4>
            </div>
            <p className="text-sm text-neutral-700 mb-3">
              Based on both your activity patterns, these times have the highest likelihood of being convenient:
            </p>
            
            <div className="space-y-2">
              {optimalTimes.times.map((time: OptimalTime, index: number) => (
                <div 
                  key={index}
                  className={`bg-white border ${selectedOptimalTime === time ? 'border-accent' : 'border-neutral-200'} rounded-lg p-3 flex justify-between items-center cursor-pointer`}
                  onClick={() => handleOptimalTimeSelect(time)}
                >
                  <span className={selectedOptimalTime === time ? 'font-medium' : ''}>
                    {time.day}, {time.time}
                  </span>
                  <div className={`flex items-center text-sm ${time.confidence > 0.8 ? 'text-success' : 'text-neutral-500'}`}>
                    <i className={`fas ${time.confidence > 0.8 ? 'fa-check-circle' : 'fa-star'} mr-1`}></i>
                    <span>{time.confidence > 0.8 ? 'Best Match' : 'Good Option'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Choose Custom Date & Time</h4>
          <div className="mb-4">
            <label className="block text-sm text-neutral-600 mb-1">Date</label>
            <Input 
              type="date" 
              className="w-full border border-neutral-300 rounded-lg p-3"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Time</label>
            <Input 
              type="time" 
              className="w-full border border-neutral-300 rounded-lg p-3"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Add a note (optional)</h4>
          <Textarea
            placeholder="Looking forward to our video date!"
            className="w-full border border-neutral-300 rounded-lg p-3 h-24 resize-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
        {videoDateTips && videoDateTips.tips && (
          <AiSuggestion
            title="AI Video Date Tips"
            type="secondary"
            icon="lightbulb"
            className="mb-6"
          >
            <p className="text-sm text-neutral-700 mb-2">Based on your shared interests:</p>
            <ul className="list-disc text-sm text-neutral-700 pl-5 space-y-1">
              {videoDateTips.tips.map((tip: string, index: number) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </AiSuggestion>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 bg-white p-4">
        <Button 
          className="w-full bg-primary text-white py-3 rounded-full font-montserrat shadow-button"
          onClick={handleScheduleCall}
          disabled={!selectedDate || !selectedTime || scheduleVideoCallMutation.isPending}
        >
          {scheduleVideoCallMutation.isPending ? (
            <span className="flex items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Scheduling...
            </span>
          ) : (
            'Send Video Date Invitation'
          )}
        </Button>
      </div>
    </div>
  );
}
