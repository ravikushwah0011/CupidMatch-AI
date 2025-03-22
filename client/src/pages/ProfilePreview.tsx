import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Profile {
  username: string;
  profileName: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  occupation: string;
  education: string;
  lookingFor: string;
  interests: string[];
  profileVideoUrl: string;
}

export default function ProfilePreview() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { register } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
      } catch (error) {
        console.error("Error parsing stored profile:", error);
        navigate("/profile-creation");
      }
    } else {
      navigate("/profile-creation");
    }
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/profile-creation");
  };

  const handleCreateAccount = async () => {
    if (!profile) return;

    try {
      await register({
        ...profile,
        interests: profile.interests || []
      });
      localStorage.removeItem('userProfile'); // Clear stored profile
      navigate("/");
      toast({
        title: "Success!",
        description: "Your profile has been created.",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (!profile) return null;

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <button className="text-neutral-600" onClick={handleEditProfile}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-xl font-semibold">Preview Your Profile</h2>
        <div></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h3 className="text-xl font-semibold mb-2">{profile.profileName}, {profile.age}</h3>
          <p className="text-neutral-600 mb-4">{profile.location}</p>
          <p className="mb-4">{profile.bio}</p>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest, index) => (
                <span key={index} className="bg-neutral-100 px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p><strong>Occupation:</strong> {profile.occupation}</p>
            <p><strong>Education:</strong> {profile.education}</p>
            <p><strong>Looking for:</strong> {profile.lookingFor}</p>
          </div>
        </div>
      </div>

      <div className="action-buttons flex gap-4">
        <Button 
          variant="outline"
          className="flex-1"
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
        <Button 
          className="flex-1"
          onClick={handleCreateAccount}
        >
          Complete Registration
        </Button>
      </div>
    </div>
  );
}