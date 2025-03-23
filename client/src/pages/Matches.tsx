import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";

interface Match {
  id: number;
  status: string;
  timestamp: string;
  compatibilityScore: number;
  otherUser: {
    id: number;
    profileName: string;
    age: number;
    location: string;
    profileVideoUrl?: string;
  };
}

export default function Matches() {
  const [, navigate] = useLocation();

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const handleMatchClick = (matchId: number) => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="p-4 border-b border-neutral-200">
        <h1 className="text-xl font-semibold text-center">Your Matches</h1>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMatchClick(match.id)}
              >
                <div className="flex">
                  <div className="w-24 h-24 bg-neutral-200 relative">
                    {match.otherUser.profileVideoUrl ? (
                      <video
                        src={match.otherUser.profileVideoUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                        <i className="fas fa-user text-2xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {match.otherUser.profileName}, {match.otherUser.age}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {match.otherUser.location}
                        </p>
                      </div>
                      {match.compatibilityScore && (
                        <span className="bg-emerald-500  text-accent px-2 py-1 rounded-full text-xs">
                          {match.compatibilityScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-neutral-500">
                        Matched {new Date(match.timestamp).toLocaleDateString()}
                      </span>
                      <button className="text-primary text-sm">
                        Message{" "}
                        <i className="fas fa-chevron-right text-xs ml-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="fas fa-heart text-4xl text-neutral-300 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-neutral-500">
              Start discovering people to find your perfect match
            </p>
          </div>
        )}
      </main>

      {/* <Navbar /> */}
    </div>
  );
}
