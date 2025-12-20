// Fichier: src/lib/openai.js

export async function generatePostContent(prompt, profile) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Clé API manquante");
    alert("Erreur: Clé API OpenAI manquante dans le fichier .env");
    return null;
  }

  // On construit un contexte riche pour l'IA
  const systemPrompt = `Tu es un expert en marketing digital pour des commerces locaux.
  Ton client est : ${profile?.name || "une entreprise locale"} situé à ${profile?.city || "France"}.
  
  Règles de rédaction :
  - Ton pro, engageant et humain.
  - Utilise des emojis pertinents.
  - Structure le texte avec des sauts de ligne.
  - Pas de hashtags dans le corps du texte (ils sont gérés à part).
  - Termine par un appel à l'action clair (ex: "Venez nous voir", "Cliquez sur le lien").
  
  Format de réponse attendu (JSON uniquement) :
  {
    "title": "Un titre court pour usage interne (max 5 mots)",
    "content": "Le contenu du post pour les réseaux sociaux",
    "image_keyword": "Une description visuelle précise en anglais pour générer une image photoréaliste (ex: 'cozy coffee shop interior with morning light, professional photography')"
  }`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Ou "gpt-4" si vous avez l'accès
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // On parse le résultat JSON de l'IA
    const content = data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      // Fallback si l'IA ne renvoie pas un JSON parfait
      console.warn("L'IA n'a pas renvoyé de JSON pur, tentative de récupération...");
      return {
        title: "Nouveau Post",
        content: content,
        image_keyword: "modern business office professional"
      };
    }

  } catch (error) {
    console.error("Erreur OpenAI:", error);
    alert("Erreur lors de la génération. Vérifiez votre clé API.");
    return null;
  }
}
