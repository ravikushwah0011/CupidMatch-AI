import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-poppins font-semibold text-neutral-900">
          Welcome to{" "}
          <span className="text-primary">
            Match<span className="text-blue-600">AI</span>
          </span>
        </h1>
        <div className="w-2 h-2 rounded-full bg-success"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-secondary flex justify-center items-center mb-8">
          <i className="fas fa-robot text-white text-5xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">
          I'm Cupid, your AI dating assistant
        </h2>
        <p className="text-center text-neutral-600 mb-6">
          I'll help you create a profile that attracts the right matches and
          guide you throughout your dating journey.
        </p>
        <Button
          onClick={handleGetStarted}
          className="bg-primary text-white font-montserrat py-3 px-8 rounded-full shadow-button hover:bg-opacity-90 transition duration-300"
        >
          Let's Get Started
        </Button>
        <p className="mt-4 text-neutral-600">
          Already have an account?{" "}
          <a href="/login" className="text-primary">
            Login here
          </a>
        </p>
      </div>

      <div className="text-center text-sm text-neutral-500">
        <p>
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
