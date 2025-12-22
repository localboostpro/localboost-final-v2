import { supabase } from "./supabase";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("🧠 Démarrage IA avec le prompt :", prompt);

  if (!OPENAI_API_KEY) {
    console.error("❌ CRITIQUE : Clé API manquante !");
    throw new Error("Clé API introuvable. Vérifiez les variables Vercel.");
  }

  try {
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
            content: `Tu es un expert marketing. Réponds UNIQUEMENT en JSON valide :
            {
              "title": "Titre court",
              "content": "Texte du post",
              "image_keyword": "mot clé anglais",
              "hashtags": ["#tag"]
            }`
          },
          { role: "user", content: `Sujet: ${prompt}. Entreprise: ${profile?.name || "Pro"}. Ville: ${profile?.city || "France"}` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Erreur OpenAI reçue :", data.error);
      throw new Error(`OpenAI Error: ${data.error.message}`);
    }

    const rawContent = data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("❌ Erreur de parsing JSON :", rawContent);
      throw new Error("L'IA a renvoyé un format invalide.");
    }

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword
    };

  } catch (error) {
    console.error("❌ CRASH FINAL :", error);
    throw error;
  }
};
