import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import AiSuggestion from "@/components/AiSuggestion";
import MatchPopup from "@/components/MatchPopup";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useUser();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchData, setMatchData] = useState<{
    matchId: number;
    userId: number;
    matchedUserId: number;
  } | null>(null);

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isAuthenticated) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate]);

  // Fetch potential matches
  const {
    data: potentialMatches,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/matches/potential"],
    enabled: isAuthenticated,
  });

  const currentProfile =
    potentialMatches && potentialMatches.length > currentProfileIndex
      ? potentialMatches[currentProfileIndex]
      : null;

  const handleNextProfile = () => {
    if (potentialMatches && currentProfileIndex < potentialMatches.length - 1) {
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      // No more profiles, refetch or show empty state
      refetch();
    }
  };

  const handleMatch = (
    matchId: number,
    userId: number,
    matchedUserId: number,
  ) => {
    setMatchData({ matchId, userId, matchedUserId });
    setShowMatchPopup(true);
  };

  const closeMatchPopup = () => {
    setShowMatchPopup(false);
    setMatchData(null);
  };

  const handleUserProfile = () => {
    navigate("/profile");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="Your profile"
            className="w-10 h-10 rounded-full object-cover border border-neutral-200"
          />
        </div>
        <div className="logo">
          <h1 className="text-xl font-poppins font-semibold">
            Match<span className="text-primary">AI</span>
          </h1>
        </div>
        <div className="filters">
          <button
            onClick={handleUserProfile}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faSliders}
              className="text-xl text-primary"
            />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : potentialMatches && potentialMatches.length > 0 ? (
          <>
            {currentProfile && (
              <ProfileCard
                profile={currentProfile}
                onLike={handleNextProfile}
                onPass={handleNextProfile}
              />
            )}

            <AiSuggestion
              title="AI Matchmaker Insight"
              type="secondary"
              icon="magic"
            >
              <p className="mb-3">
                I've noticed you often connect with people who enjoy outdoor
                activities. I've prioritized profiles with similar interests in
                your discovery feed.
              </p>
              <div className="flex">
                <Button
                  variant="link"
                  className="text-secondary text-sm font-medium p-0"
                >
                  Adjust Preferences
                </Button>
                <Button
                  variant="link"
                  className="text-neutral-500 text-sm ml-4 p-0"
                >
                  Got it
                </Button>
              </div>
            </AiSuggestion>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fas fa-search text-4xl text-neutral-300 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No matches found</h3>
            <p className="text-neutral-500 mb-4">
              We're working on finding your perfect match
            </p>
            <Button onClick={() => refetch()}>Refresh</Button>
          </div>
        )}
      </main>

      {/* Match Popup */}
      {showMatchPopup && matchData && (
        <MatchPopup
          matchId={matchData.matchId}
          userId={matchData.userId}
          matchedUserId={matchData.matchedUserId}
          onClose={closeMatchPopup}
        />
      )}

      {/* <Navbar /> */}
    </div>
  );
}
