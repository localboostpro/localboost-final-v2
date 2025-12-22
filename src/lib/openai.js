import { supabase } from "./supabase";

// Access the environment variable
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("🚀 Starting AI Generation...");

  // 1. Check if Key exists
  if (!OPENAI_API_KEY) {
    console.error("CRITICAL: Missing API Key. Please add VITE_OPENAI_API_KEY to Vercel Environment Variables.");
    throw new Error("Clé API manquante. Configuration requise sur Vercel.");
  }

  try {
    // 2. Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a marketing expert for a local business named "${profile?.name || 'Local Business'}". 
            City: "${profile?.city || 'France'}".
            Output JSON only: { "title": "...", "content": "...", "hashtags": ["#tag"], "image_keyword": "..." }`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 3. Handle OpenAI Errors (Quota, Invalid Key, etc.)
    if (data.error) {
      console.error("❌ OpenAI API Error:", data.error);
      throw new Error(data.error.message || "Erreur lors de l'appel à l'IA");
    }

    // 4. Parse Response
    const contentRaw = data.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        console.error("❌ JSON Parse Error:", contentRaw);
        throw new Error("L'IA a généré un format invalide.");
    }

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword
    };

  } catch (error) {
    console.error("❌ FINAL ERROR:", error);
    throw error;
  }
};
