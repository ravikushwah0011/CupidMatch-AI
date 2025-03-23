import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/context/UserContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import VideoPlayer from "./VideoPlayer";
import {
  faHeart,
  faPause,
  faPlay,
  faRobot,
  faTimes,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ProfileCardProps {
  profile: {
    id: number;
    profileName: string;
    age: number;
    location: string;
    bio: string;
    interests: string[];
    profileVideoUrl?: string;
    compatibilityScore?: number;
    compatibilityReasons?: string[];
  };
  onLike?: () => void;
  onPass?: () => void;
}

export default function ProfileCard({
  profile,
  onLike,
  onPass,
}: ProfileCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      return apiRequest("POST", "/api/matches", {
        userId1: user.id,
        userId2: profile.id,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/potential"] });
      toast({
        title: "Profile liked",
        description: "If they like you back, it's a match!",
      });
      if (onLike) onLike();
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const passMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      return apiRequest("POST", "/api/matches", {
        userId1: user.id,
        userId2: profile.id,
        status: "rejected",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches/potential"] });
      if (onPass) onPass();
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handlePass = () => {
    passMutation.mutate();
  };

  const handleVideoCall = () => {
    navigate(`/video-schedule/${profile.id}`);
  };

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  return (
    <div className="profile-card bg-white rounded-xl shadow-card mb-6 overflow-hidden">
      <div className="relative">
        <div className="video-placeholder relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>

          {profile.profileVideoUrl ? (
            <VideoPlayer
              url={profile.profileVideoUrl}
              isPlaying={isVideoPlaying}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
              <span className="text-white text-opacity-50">
                No video available
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-semibold">
                  {profile.profileName}, {profile.age}
                </h3>
                <p className="text-white text-opacity-90">{profile.location}</p>
              </div>
              {profile.compatibilityScore && (
                <div className="bg-accent text-white rounded-full px-3 py-1 text-sm flex items-center">
                  <i className="fas fa-magic mr-1"></i>
                  <span>{profile.compatibilityScore}% Match</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <button
              className="w-10 h-10 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-white"
              onClick={toggleVideo}
            >
              <FontAwesomeIcon
                icon={isVideoPlaying ? faPause : faPlay}
                className="text-xl text-primary"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h4 className="text-lg font-semibold mb-1">
            About {profile.profileName}
          </h4>
          <p className="text-neutral-700 text-sm">{profile.bio}</p>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-semibold text-neutral-600 mb-2">
            Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-neutral-100 px-3 py-1 rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {profile.compatibilityReasons &&
          profile.compatibilityReasons.length > 0 && (
            <div className="ai-compatibility bg-emerald-500 rounded-lg p-3 mb-4">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faRobot} className="text-xl text-accent mr-2" />
                
                <h4 className="text-sm font-semibold">Why you might connect</h4>
              </div>
              <ul className="list-disc pl-5 text-sm text-neutral-700">
                {profile.compatibilityReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

        <div className="flex justify-between">
          <Button
            onClick={handlePass}
            variant="outline"
            className="w-16 h-16 rounded-full flex items-center justify-center text-neutral-500 text-2xl p-0"
            disabled={passMutation.isPending}
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl text-primary" />
          </Button>

          <Button
            onClick={handleVideoCall}
            variant="secondary"
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl p-0 bg-accent hover:bg-accent/90"
          >
            <FontAwesomeIcon icon={faVideo} className="text-xl text-primary" />
          </Button>

          <Button
            onClick={handleLike}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl p-0"
            disabled={likeMutation.isPending}
          >
            <FontAwesomeIcon icon={faHeart} className="text-xl" />
          </Button>
        </div>
      </div>
    </div>
  );
}
