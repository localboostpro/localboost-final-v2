import { supabase } from "./supabase";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("🧠 Démarrage IA avec le prompt :", prompt);

  // 1. Vérification de la clé
  if (!OPENAI_API_KEY) {
    console.error("❌ Pas de clé API trouvée !");
    throw new Error("Clé API manquante. Ajoutez VITE_OPENAI_API_KEY dans Vercel.");
  }

  try {
    // 2. Appel à l'API OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Ou gpt-4o si vous avez le budget
        messages: [
          {
            role: "system",
            content: `Tu es un expert marketing pour ${profile?.name || "une entreprise"}. 
            Ville : ${profile?.city || "France"}.
            Format de réponse attendu (JSON pur uniquement) :
            {
              "title": "Titre accrocheur",
              "content": "Contenu du post avec emojis",
              "image_keyword": "mot clé anglais pour photo",
              "hashtags": ["#tag1", "#tag2"]
            }`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 3. Gestion des erreurs OpenAI (Quota dépassé, clé invalide...)
    if (data.error) {
      console.error("❌ Erreur OpenAI :", data.error);
      throw new Error(data.error.message || "Erreur lors de l'appel à l'IA");
    }

    // 4. Parsing de la réponse
    const contentRaw = data.choices[0].message.content;
    const parsed = JSON.parse(contentRaw);

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword
    };

  } catch (error) {
    console.error("❌ CRASH IA :", error);
    throw error; // Renvoie l'erreur pour afficher l'alerte
  }
};
