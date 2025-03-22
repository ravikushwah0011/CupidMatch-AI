import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Define safety settings to ensure appropriate content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Interface definitions for response types
export interface ProfileSuggestionResponse {
  bio: string;
  interests: string[];
}

export interface ConversationStarterResponse {
  starters: string[];
}

export interface VideoDateTipResponse {
  tips: string[];
}

export interface OptimalTimeResponse {
  times: Array<{
    day: string;
    time: string;
    confidence: number;
  }>;
}

export interface MatchCompatibilityResponse {
  score: number;
  reasons: string[];
}

// Helper function to parse JSON response safely
async function parseJsonResponse(responseText: string): Promise<any> {
  try {
    // Find JSON content between any potential text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    console.error("Response text:", responseText);
    throw new Error("Failed to parse JSON response");
  }
}

// Generate user profile based on their input
export async function generateUserProfile(userInputs: Record<string, any>): Promise<ProfileSuggestionResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    const prompt = `
      Generate an engaging dating profile based on the following information:
      
      Interests: ${userInputs.interests?.join(', ') || 'Not specified'}
      Age: ${userInputs.age || 'Not specified'}
      Gender: ${userInputs.gender || 'Not specified'}
      Location: ${userInputs.location || 'Not specified'}
      Occupation: ${userInputs.occupation || 'Not specified'}
      Education: ${userInputs.education || 'Not specified'}
      Looking for: ${userInputs.lookingFor || 'Not specified'}
      
      Generate a compelling bio (maximum 200 characters) and a refined list of interests.
      Respond in JSON format with fields: "bio" (string) and "interests" (array of strings).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings,
    });

    const response = result.response;
    return await parseJsonResponse(response.text()) as ProfileSuggestionResponse;
  } catch (error) {
    console.error("Error generating profile:", error);
    return {
      bio: "Enjoys meeting new people and having meaningful conversations.",
      interests: ["Dating", "Conversation", "Meeting new people"]
    };
  }
}

// Generate conversation starters based on shared interests
export async function generateConversationStarters(
  user1Interests: string[],
  user2Interests: string[],
  user2Name: string
): Promise<ConversationStarterResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    const sharedInterests = user1Interests.filter(interest => 
      user2Interests.includes(interest)
    );
    
    const prompt = `
      Generate 3 engaging conversation starters for a dating app chat with ${user2Name}.
      
      My interests: ${user1Interests.join(', ')}
      ${user2Name}'s interests: ${user2Interests.join(', ')}
      ${sharedInterests.length > 0 ? `Shared interests: ${sharedInterests.join(', ')}` : 'We don\'t seem to have shared interests yet.'}
      
      Make the conversation starters personal, engaging, and relevant to the shared interests if any.
      Each starter should be 1-2 sentences maximum.
      Respond in JSON format with field: "starters" (array of strings).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings,
    });

    const response = result.response;
    return await parseJsonResponse(response.text()) as ConversationStarterResponse;
  } catch (error) {
    console.error("Error generating conversation starters:", error);
    return {
      starters: [
        "Hi there! What's been the highlight of your day so far?",
        "I'd love to know more about your interests. What are you passionate about?",
        "If you could travel anywhere right now, where would you go?"
      ]
    };
  }
}

// Generate video date tips based on user profiles
export async function generateVideoDateTips(
  user1: Record<string, any>,
  user2: Record<string, any>
): Promise<VideoDateTipResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    const prompt = `
      Generate 3 personalized tips for a successful video date between these two users:
      
      User 1: ${user1.profileName}, ${user1.age}, ${user1.gender}
      Interests: ${user1.interests.join(', ')}
      Bio: ${user1.bio || 'Not specified'}
      
      User 2: ${user2.profileName}, ${user2.age}, ${user2.gender}
      Interests: ${user2.interests.join(', ')}
      Bio: ${user2.bio || 'Not specified'}
      
      Provide specific, actionable tips related to their shared interests or complementary qualities.
      Each tip should be specific and personalized.
      Respond in JSON format with field: "tips" (array of strings).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings,
    });

    const response = result.response;
    return await parseJsonResponse(response.text()) as VideoDateTipResponse;
  } catch (error) {
    console.error("Error generating video date tips:", error);
    return {
      tips: [
        "Find a quiet space with good lighting for your video call",
        "Prepare a few topics based on your shared interests",
        "Be yourself and enjoy getting to know each other"
      ]
    };
  }
}

// Suggest optimal times for video dates
export async function suggestOptimalTimes(): Promise<OptimalTimeResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    // In a real app, we would use user activity patterns
    // For now, we'll generate some reasonable suggestions
    const prompt = `
      Suggest 3 optimal times for a video date on a dating app.
      Consider common free times when people might be available.
      For each suggestion, include the day of the week, time, and a confidence score (0-1).
      Respond in JSON format with field: "times" (array of objects with "day", "time", and "confidence").
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings,
    });

    const response = result.response;
    return await parseJsonResponse(response.text()) as OptimalTimeResponse;
  } catch (error) {
    console.error("Error suggesting optimal times:", error);
    return {
      times: [
        { day: "Saturday", time: "6:00 PM", confidence: 0.9 },
        { day: "Sunday", time: "3:00 PM", confidence: 0.8 },
        { day: "Friday", time: "7:30 PM", confidence: 0.7 }
      ]
    };
  }
}

// Calculate match compatibility score between two users
export async function calculateMatchCompatibility(
  user1: Record<string, any>,
  user2: Record<string, any>
): Promise<MatchCompatibilityResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    
    const prompt = `
      Calculate the compatibility between these two dating app users:
      
      User 1: ${user1.profileName}, ${user1.age}, ${user1.gender}
      Interests: ${user1.interests.join(', ')}
      Bio: ${user1.bio || 'Not specified'}
      Looking for: ${user1.lookingFor}
      
      User 2: ${user2.profileName}, ${user2.age}, ${user2.gender}
      Interests: ${user2.interests.join(', ')}
      Bio: ${user2.bio || 'Not specified'}
      Looking for: ${user2.lookingFor}
      
      Provide a compatibility score (0-100) and 2-3 specific reasons for the score.
      Consider shared interests, complementary qualities, and relationship goals.
      Respond in JSON format with fields: "score" (number) and "reasons" (array of strings).
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings,
    });

    const response = result.response;
    return await parseJsonResponse(response.text()) as MatchCompatibilityResponse;
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return {
      score: 50, // Default middle score
      reasons: ["Unable to calculate detailed compatibility at this time"]
    };
  }
}