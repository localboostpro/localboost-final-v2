// ⚠️ NE RIEN IMPORTER D'AUTRE ICI (Pas de Supabase, pas de lib)
// Cela évite l'erreur "r is not a function" due aux conflits de fichiers.

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generatePostContent = async (prompt, profile) => {
  console.log("🔵 Démarrage fonction IA...");

  // 1. Vérification de la clé
  if (!OPENAI_API_KEY) {
    console.error("⛔ CLÉ MANQUANTE : VITE_OPENAI_API_KEY est introuvable.");
    throw new Error("Clé API manquante sur Vercel. Vérifiez vos variables d'environnement.");
  }

  // 2. Préparation des données (Ville/Nom) avec valeurs par défaut de sécurité
  const businessName = profile?.name || "Mon Entreprise";
  const businessCity = profile?.city || "France";

  try {
    // 3. Appel direct à l'API (Sans passer par une librairie tierce qui pourrait planter)
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
            content: `Tu es un expert marketing pour "${businessName}" situé à "${businessCity}".
            Tu dois répondre UNIQUEMENT avec un objet JSON valide.
            Format attendu:
            {
              "title": "Titre accrocheur",
              "content": "Texte du post (engageant, avec emojis)",
              "hashtags": ["#tag1", "#tag2"],
              "image_keyword": "mot clé pour décrire l'image en anglais"
            }`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    // 4. Lecture de la réponse
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Erreur API OpenAI :", errorData);
      // Gestion spécifique du quota
      if (response.status === 429) throw new Error("Quota OpenAI dépassé ou crédit insuffisant.");
      if (response.status === 401) throw new Error("Clé API invalide.");
      throw new Error(errorData.error?.message || "Erreur serveur OpenAI");
    }

    const data = await response.json();
    const contentRaw = data.choices[0].message.content;

    // 5. Nettoyage et Parsing du JSON
    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        console.warn("⚠️ Le format JSON est imparfait, tentative de récupération...");
        // Fallback manuel si l'IA bavarde
        return {
            title: "Suggestion IA",
            content: contentRaw,
            image_keyword: "business",
            hashtags: []
        };
    }

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword || "work"
    };

  } catch (error) {
    console.error("❌ CRASH DANS OPENAI.JS :", error);
    throw error; // Renvoie l'erreur pour l'afficher dans l'alerte
  }
};
