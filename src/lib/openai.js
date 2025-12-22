const RAW_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("👉 Démarrage IA (Mode Strict)");

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
            content: `Tu es un expert marketing. 
            RÈGLE ABSOLUE : Réponds UNIQUEMENT avec du JSON brut. Pas de phrase d'intro, pas de markdown (pas de \`\`\`json).
            Format attendu :
            {
              "title": "Titre court et punchy (max 50 caractères)",
              "content": "Contenu du post engageant avec emojis",
              "hashtags": ["#tag1", "#tag2"],
              "image_keyword": "mot clé anglais simple pour photo"
            }`
          },
          { role: "user", content: `Sujet: ${prompt}. Entreprise: ${profile?.name || "Pro"}` }
        ],
        temperature: 0.7 
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error("Erreur OpenAI: " + (err.error?.message || response.statusText));
    }

    const data = await response.json();
    let contentRaw = data.choices[0].message.content;

    console.log("📝 Réponse brute IA :", contentRaw);

    // --- NETTOYAGE ANTI-BAFOUILLE ---
    // 1. On enlève les balises Markdown ```json et ```
    contentRaw = contentRaw.replace(/```json/g, "").replace(/```/g, "");
    // 2. On enlève le texte avant le premier "{" et après le dernier "}"
    const firstBrace = contentRaw.indexOf("{");
    const lastBrace = contentRaw.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      contentRaw = contentRaw.substring(firstBrace, lastBrace + 1);
    }

    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        console.warn("⚠️ JSON toujours invalide malgré nettoyage.");
        // Mode secours propre
        return { 
          title: "Idée Marketing", 
          content: contentRaw, // On affiche le texte brut si ça rate
          image_keyword: "office",
          hashtags: []
        };
    }

    // Sécurisation finale des champs
    return {
      title: String(parsed.title || "Nouveau Post").substring(0, 60), // On coupe si trop long
      content: String(parsed.content || ""),
      image_keyword: String(parsed.image_keyword || "business"),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
    };

  } catch (error) {
    console.error("❌ CRASH IA:", error);
    throw error;
  }
};
