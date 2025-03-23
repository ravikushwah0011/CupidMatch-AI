import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface UserInput {
  key: string;
  value: string | string[];
}

export default function ProfileCreation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [userInputs, setUserInputs] = useState<UserInput[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [aiMessage, setAiMessage] = useState<string>(
    "What do you enjoy doing in your free time?",
  );
  const [options, setOptions] = useState<string[]>([
    "Reading",
    "Hiking",
    "Cooking",
    "Photography",
    "Travel",
    "Music",
    "Sports",
    "Art",
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Questions to ask sequentially
  const questions = [
    "What do you enjoy doing in your free time?",
    "What kind of relationship are you looking for?",
    "Tell me a bit about yourself. What's your name and age?",
    "Where are you located?",
    "What do you do for work?",
    "What's your education background?",
    "What qualities are you looking for in a partner?",
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [userInputs, aiMessage]);

  // Update progress bar
  useEffect(() => {
    setProgress((step / (questions.length + 1)) * 100);
  }, [step]);

  const generateProfileMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest(
        "POST",
        "/api/ai/generate-profile",
        data,
      );

      return response.json();
    },
    onSuccess: (data) => {
      // Store generated profile data in localStorage to use in next step
      localStorage.setItem("generatedProfile", JSON.stringify(data));
      console.log("Resposne from geminiAI", data);
      navigate("/profile-preview");
    },
    onError: (error) => {
      toast({
        title: "Profile generation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleOptionSelect = (option: string) => {
    setCurrentInput(option);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    // Add user's input to the list
    const newUserInput: UserInput = {
      key: getInputKey(step),
      value: currentInput,
    };

    setUserInputs([...userInputs, newUserInput]);
    setCurrentInput("");

    // Move to next question or finish
    if (step < questions.length) {
      setStep(step + 1);
      setAiMessage(questions[step]);

      // Update options based on the next question
      updateOptionsForQuestion(step + 1);
    } else {
      // Final step - generate profile
      const profileData = userInputsToProfileData();
      generateProfileMutation.mutate(profileData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const getInputKey = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        return "interests";
      case 2:
        return "lookingFor";
      case 3:
        return "nameAge";
      case 4:
        return "location";
      case 5:
        return "occupation";
      case 6:
        return "education";
      case 7:
        return "partnerQualities";
      default:
        return "other";
    }
  };

  const updateOptionsForQuestion = (stepNum: number) => {
    switch (stepNum) {
      case 1: // Interests
        setOptions([
          "Reading",
          "Hiking",
          "Cooking",
          "Photography",
          "Travel",
          "Music",
          "Sports",
          "Art",
        ]);
        break;
      case 2: // Relationship type
        setOptions(["Long-term", "Casual", "Friendship", "Not sure yet"]);
        break;
      case 3: // Name and age
        setOptions([]); // No predefined options for name/age
        break;
      case 4: // Location
        setOptions([
          "New York",
          "Los Angeles",
          "Chicago",
          "San Francisco",
          "Miami",
          "Austin",
          "Seattle",
        ]);
        break;
      case 5: // Occupation
        setOptions([
          "Software Engineer",
          "Designer",
          "Teacher",
          "Healthcare",
          "Marketing",
          "Student",
          "Entrepreneur",
        ]);
        break;
      case 6: // Education
        setOptions([
          "High School",
          "Associate's Degree",
          "Bachelor's Degree",
          "Master's Degree",
          "PhD",
        ]);
        break;
      case 7: // Partner qualities
        setOptions([
          "Kind",
          "Ambitious",
          "Funny",
          "Adventurous",
          "Intelligent",
          "Creative",
          "Reliable",
        ]);
        break;
      default:
        setOptions([]);
    }
  };

  const userInputsToProfileData = (): Record<string, any> => {
    const data: Record<string, any> = {
      interests: [],
      lookingFor: "",
      profileName: "",
      age: 25,
      location: "",
      occupation: "",
      education: "",
      partnerQualities: [],
    };

    userInputs.forEach((input) => {
      if (input.key === "nameAge") {
        // Parse name and age from combined input
        const match = input.value.toString().match(/([a-zA-Z]+)\s*,?\s*(\d+)/);
        if (match) {
          data.profileName = match[1];
          data.age = parseInt(match[2]);
        } else {
          data.profileName = input.value.toString();
        }
      } else if (
        input.key === "interests" ||
        input.key === "partnerQualities"
      ) {
        // Convert comma-separated string to array if needed
        if (typeof input.value === "string") {
          data[input.key] = input.value.split(",").map((item) => item.trim());
        } else {
          data[input.key] = input.value;
        }
      } else {
        data[input.key] = input.value;
      }
    });

    return data;
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setAiMessage(questions[step - 2]);
      setUserInputs(userInputs.slice(0, -1));
      updateOptionsForQuestion(step - 1);
    } else {
      navigate("/onboarding");
    }
  };

  const handleSkip = () => {
    // Collect basic profile data and proceed
    localStorage.setItem(
      "generatedProfile",
      JSON.stringify({
        bio: "I enjoy meeting new people and having meaningful conversations.",
        interests: ["Dating", "Conversation", "Meeting new people"],
      }),
    );
    navigate("/profile-preview");
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <button className="text-neutral-600" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="h-1 flex-1 mx-4 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <button className="text-neutral-600" onClick={handleSkip}>
          Skip
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tell me about yourself</h2>
        <p className="text-neutral-600">
          I'll help create an engaging profile based on your responses.
        </p>
      </div>

      <div
        ref={chatContainerRef}
        className="ai-chat-container flex-1 overflow-y-auto mb-4 flex flex-col"
      >
        {/* AI Messages and User Responses */}
        {userInputs.map((input, index) => (
          <div key={index}>
            <div className="ai-message message-bubble-received bg-neutral-100 p-4 mb-4 inline-block">
              <p>{questions[index]}</p>
            </div>
            <div className="user-message message-bubble-sent bg-primary text-white p-4 mb-4 inline-block ml-auto">
              <p>{input.value.toString()}</p>
            </div>
          </div>
        ))}

        {/* Current AI Message */}
        <div className="ai-message message-bubble-received bg-neutral-100 p-4 mb-4 inline-block">
          <p>{aiMessage}</p>
        </div>

        {/* Option Buttons if available */}
        {options.length > 0 && (
          <div className="user-options flex flex-wrap gap-2 mb-4">
            {options.map((option, index) => (
              <button
                key={index}
                className={`bg-white border ${currentInput === option ? "border-primary" : "border-neutral-300"} rounded-full px-4 py-2 text-sm hover:bg-neutral-50`}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </button>
            ))}
            <button
              className="bg-white border border-neutral-300 rounded-full px-4 py-2 text-sm hover:bg-neutral-50"
              onClick={() => setCurrentInput(currentInput ? currentInput : "")}
            >
              + Add custom
            </button>
          </div>
        )}
      </div>

      <div className="message-input-container border-t border-neutral-200 pt-4">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Type your response..."
            className="flex-1 border border-neutral-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            value={currentInput}
            onChange={handleCustomInput}
            onKeyDown={handleKeyPress}
          />
          <Button
            className="ml-2 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center p-0"
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || generateProfileMutation.isPending}
          >
            {generateProfileMutation.isPending ? (
              <FontAwesomeIcon icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
