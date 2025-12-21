// src/lib/openai.js
export async function generatePostContent(prompt, profile) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ Clé API OpenAI manquante");
    return createFallbackResponse("Clé API manquante");
  }

  // System prompt amélioré pour les réseaux sociaux
  const systemPrompt = `Tu es un expert en marketing digital pour les commerces locaux.
  Règles strictes:
  1. Toujours répondre en JSON valide avec cette structure:
  {
    "title": "Titre accrocheur (max 50 caractères)",
    "content": "Contenu optimisé avec emojis (max 280 caractères)",
    "hashtags": ["#Hashtag1", "#Hashtag2"],
    "image_keyword": "Description visuelle en anglais (4-5 mots)",
    "platform_tips": "Conseil spécifique à la plateforme"
  }
  2. Adapter le ton selon la plateforme (Instagram: décontracté, LinkedIn: professionnel)
  3. Toujours inclure 2-3 hashtags pertinents en français
  4. Pour ${profile?.name || "ce commerce"} à ${profile?.city || "votre ville"}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.8, // Légèrement plus créatif
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur OpenAI:", data.error);
      return createFallbackResponse(data.error.message);
    }

    try {
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.warn("Réponse non-JSON:", data.choices[0].message.content);
      return {
        title: "Nouveau Post",
        content: data.choices[0].message.content,
        hashtags: ["#Local", "#Business"],
        image_keyword: "business marketing",
        platform_tips: "Vérifiez le format du contenu"
      };
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    return createFallbackResponse(error.message);
  }
}

function createFallbackResponse(error) {
  return {
    title: "Mode Démo",
    content: `Impossible de générer le contenu: ${error}. Voici un exemple:
    🌟 Découvrez nos nouvelles collections été!
    💥 -20% cette semaine seulement
    📍 ${Math.random() > 0.5 ? 'En magasin' : 'En ligne'}

    #Promo #Été2023`,
    hashtags: ["#Promo", "#Été"],
    image_keyword: "summer sale",
    platform_tips: "Publiez entre 18h-20h pour plus d'engagement"
  };
}
