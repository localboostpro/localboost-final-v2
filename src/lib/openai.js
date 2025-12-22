// On n'importe PAS supabase ici pour éviter les conflits
// On récupère juste la clé sécurisée
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("🚀 Démarrage IA...");

  // 1. Vérification de sécurité
  if (!OPENAI_API_KEY) {
    console.error("ERREUR: Clé API manquante (VITE_OPENAI_API_KEY).");
    throw new Error("Clé API manquante sur Vercel.");
  }

  try {
    // 2. Appel direct à OpenAI
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
            content: `Tu es un expert réseaux sociaux pour ${profile?.name || "une entreprise"}.
            Format JSON requis : { "title": "...", "content": "...", "hashtags": ["#tag"], "image_keyword": "..." }`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // 3. Gestion des erreurs OpenAI (Crédit, Quota, etc.)
    if (data.error) {
      console.error("❌ Erreur OpenAI:", data.error);
      throw new Error(data.error.message || "Erreur de l'API IA");
    }

    // 4. Traitement du résultat
    const contentRaw = data.choices[0].message.content;
    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        // Fallback si l'IA n'envoie pas du JSON pur
        return {
            title: "Nouveau Post",
            content: contentRaw,
            image_keyword: "business"
        };
    }

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword
    };

  } catch (error) {
    console.error("❌ CRASH IA:", error);
    throw error;
  }
};
