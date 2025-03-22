import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" });

interface ProfileSuggestionResponse {
  bio: string;
  interests: string[];
}

interface ConversationStarterResponse {
  starters: string[];
}

interface VideoDateTipResponse {
  tips: string[];
}

interface OptimalTimeResponse {
  times: Array<{
    day: string;
    time: string;
    confidence: number;
  }>;
}

interface MatchCompatibilityResponse {
  score: number;
  reasons: string[];
}

// Generate user profile based on their input
export async function generateUserProfile(userInputs: Record<string, any>): Promise<ProfileSuggestionResponse> {
  try {
    const prompt = `
      Generate an engaging dating profile based on the following information:
      
      Interests: ${userInputs.interests.join(', ')}
      Age: ${userInputs.age}
      Gender: ${userInputs.gender}
      Location: ${userInputs.location}
      Occupation: ${userInputs.occupation || 'Not specified'}
      Education: ${userInputs.education || 'Not specified'}
      Looking for: ${userInputs.lookingFor}
      
      Generate a compelling bio (maximum 200 characters) and a refined list of interests.
      Respond in JSON format with fields: "bio" (string) and "interests" (array of strings).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as ProfileSuggestionResponse;
  } catch (error) {
    console.error("Error generating profile:", error);
    return {
      bio: "Error generating profile. Please try again later.",
      interests: []
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as ConversationStarterResponse;
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
    const prompt = `
      Generate 3 personalized tips for a successful video date between these two users:
      
      User 1: ${user1.profileName}, ${user1.age}, ${user1.gender}
      Interests: ${user1.interests.join(', ')}
      Bio: ${user1.bio}
      
      User 2: ${user2.profileName}, ${user2.age}, ${user2.gender}
      Interests: ${user2.interests.join(', ')}
      Bio: ${user2.bio}
      
      Provide specific, actionable tips related to their shared interests or complementary qualities.
      Each tip should be specific and personalized.
      Respond in JSON format with field: "tips" (array of strings).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as VideoDateTipResponse;
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
    // In a real app, we would use user activity patterns
    // For now, we'll generate some reasonable suggestions
    const prompt = `
      Suggest 3 optimal times for a video date on a dating app.
      Consider common free times when people might be available.
      For each suggestion, include the day of the week, time, and a confidence score (0-1).
      Respond in JSON format with field: "times" (array of objects with "day", "time", and "confidence").
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as OptimalTimeResponse;
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
    const prompt = `
      Calculate the compatibility between these two dating app users:
      
      User 1: ${user1.profileName}, ${user1.age}, ${user1.gender}
      Interests: ${user1.interests.join(', ')}
      Bio: ${user1.bio}
      Looking for: ${user1.lookingFor}
      
      User 2: ${user2.profileName}, ${user2.age}, ${user2.gender}
      Interests: ${user2.interests.join(', ')}
      Bio: ${user2.bio}
      Looking for: ${user2.lookingFor}
      
      Provide a compatibility score (0-100) and 2-3 specific reasons for the score.
      Consider shared interests, complementary qualities, and relationship goals.
      Respond in JSON format with fields: "score" (number) and "reasons" (array of strings).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content) as MatchCompatibilityResponse;
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return {
      score: 50, // Default middle score
      reasons: ["Unable to calculate detailed compatibility at this time"]
    };
  }
}
