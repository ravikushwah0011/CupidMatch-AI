import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface GeneratedProfile {
  bio: string;
  interests: string[];
}

export default function ProfilePreview() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { register } = useUser();
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null);
  const [profile, setProfile] = useState({
    username: "",
    password: "",
    profileName: "",
    age: 25,
    gender: "Not specified",
    location: "New York",
    bio: "",
    occupation: "Not specified",
    education: "Not specified",
    lookingFor: "Long-term relationship",
    interests: [] as string[],
    profileVideoUrl: "https://example.com/sample-video.mp4", // Placeholder URL
  });
  
  useEffect(() => {
    // Get generated profile from localStorage
    const storedProfile = localStorage.getItem('generatedProfile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as GeneratedProfile;
        setGeneratedProfile(parsed);
        
        // Update profile with generated data
        setProfile(prev => ({
          ...prev,
          bio: parsed.bio,
          interests: parsed.interests,
        }));
      } catch (error) {
        console.error("Error parsing stored profile:", error);
      }
    }
    
    // Auto-generate username and password for demo
    const randomId = Math.floor(Math.random() * 10000);
    setProfile(prev => ({
      ...prev,
      username: `user${randomId}`,
      password: `pass${randomId}`,
    }));
  }, []);
  
  const handleEditProfile = () => {
    navigate("/profile-creation");
  };
  
  const handleCreateAccount = () => {
    register(profile);
  };
  
  const handleBack = () => {
    navigate("/profile-creation");
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <button className="text-neutral-600" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-semibold">Your AI-Generated Profile</h2>
        <div></div>
      </div>
      
      <div className="profile-preview flex-1 overflow-y-auto mb-6">
        <div className="profile-header mb-4">
          <div className="video-placeholder mb-4 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white bg-opacity-80 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <i className="fas fa-camera text-primary text-xl"></i>
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <h3 className="text-2xl font-semibold">{profile.profileName || "You"}</h3>
            <span className="ml-2 text-neutral-600">{profile.age}</span>
            <div className="ml-auto">
              <span className="bg-accent bg-opacity-10 text-accent px-3 py-1 rounded-full text-xs">
                <i className="fas fa-magic mr-1"></i> AI Enhanced
              </span>
            </div>
          </div>
        </div>
        
        <div className="profile-bio mb-6">
          <h4 className="font-semibold mb-2">About Me</h4>
          <p className="text-neutral-700 mb-4">
            {profile.bio || "AI will generate an engaging bio based on your information."}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <i className="fas fa-briefcase text-neutral-500 mr-2"></i>
              <span>{profile.occupation}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-graduation-cap text-neutral-500 mr-2"></i>
              <span>{profile.education}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-neutral-500 mr-2"></i>
              <span>{profile.location}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-heart text-neutral-500 mr-2"></i>
              <span>{profile.lookingFor}</span>
            </div>
          </div>
        </div>
        
        <div className="profile-interests mb-6">
          <h4 className="font-semibold mb-2">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <span key={index} className="bg-neutral-100 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
            {profile.interests.length === 0 && (
              <span className="text-neutral-500 text-sm">AI will suggest interests based on your responses.</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="action-buttons flex gap-4">
        <Button 
          variant="outline"
          className="flex-1 border border-neutral-300 py-3 rounded-full font-montserrat"
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
        <Button 
          className="flex-1 bg-primary text-white py-3 rounded-full font-montserrat shadow-button"
          onClick={handleCreateAccount}
        >
          Looks Good!
        </Button>
      </div>
    </div>
  );
}
