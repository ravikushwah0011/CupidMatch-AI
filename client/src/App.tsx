import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "./context/UserContext";

// Pages
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import ProfileCreation from "@/pages/ProfileCreation";
import ProfilePreview from "@/pages/ProfilePreview";
import Matches from "@/pages/Matches";
import Messages from "@/pages/Messages";
import Chat from "@/pages/Chat";
import VideoCall from "@/pages/VideoCall";
import VideoSchedule from "@/pages/VideoSchedule";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/not-found";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Navbar from "@/components/Navbar"; // Import Navbar component
import Sidebar from "@/components/Sidebar"; //Import Sidebar component
import BottomBar from "./components/BottomBar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile-creation" component={ProfileCreation} />
      <Route path="/profile-preview" component={ProfilePreview} />
      <Route path="/matches" component={Matches} />
      <Route path="/messages" component={Messages} />
      <Route path="/chat/:matchId" component={Chat} />
      <Route path="/video-call/:matchId" component={VideoCall} />
      <Route path="/video-schedule/:matchId" component={VideoSchedule} />
      <Route path="/profile" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showSidebar =
    !location.includes("/onboarding") &&
    !location.includes("/login") &&
    !location.includes("/signup");
  !location.includes("/profile-creation") &&
    !location.includes("/profile-preview");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey: ["/api/auth/me"],
        });
      } catch (error) {
        console.log("User not authenticated");
      } finally {
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Navbar />
        {/* {showSidebar && <Sidebar />} */}
        {/* <div className="max-w-md mx-auto min-h-screen bg-white shadow-lg mt-[4rem]"> */}
        <div>
          <Router />
          <Toaster />
        </div>
        <BottomBar />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
