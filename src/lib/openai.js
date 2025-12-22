const RAW_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("👉 ÉTAPE 1: Démarrage IA");

  if (!RAW_KEY) throw new Error("Clé API manquante sur Vercel.");
  const apiKey = String(RAW_KEY).trim();

  try {
    const response = await window.fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Tu es un expert marketing. Réponds UNIQUEMENT en JSON: { "title": "...", "content": "...", "hashtags": [], "image_keyword": "..." }`
          },
          { role: "user", content: `Sujet: ${prompt}. Entreprise: ${profile?.name || "Pro"}` }
        ],
        temperature: 0.7
      })
    });

    console.log("👉 ÉTAPE 4: Réponse reçue");

    if (!response.ok) {
      const err = await response.json();
      throw new Error("Erreur OpenAI: " + (err.error?.message || response.statusText));
    }

    const data = await response.json();
    const contentRaw = data.choices[0].message.content;

    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        console.warn("⚠️ JSON invalide, mode secours activé");
        return { 
          title: "Nouveau Post", 
          content: contentRaw, 
          image_keyword: "business" 
        };
    }

    // --- SÉCURISATION DES DONNÉES (C'est ici qu'on évite le bug) ---
    // On s'assure que tout est du texte ou un tableau, sinon ça plante après.
    const safeHashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags.join(" ") : "";
    
    return {
      title: String(parsed.title || "Sans titre"), // Force le texte
      content: String(parsed.content || "") + "\n\n" + safeHashtags,
      image_keyword: String(parsed.image_keyword || "work")
    };

  } catch (error) {
    console.error("❌ CRASH:", error);
    throw error;
  }
};
