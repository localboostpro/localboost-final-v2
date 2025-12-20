// Fichier : src/lib/openai.js

export async function generatePostContent(prompt, profile) {
  // Récupération de la clé API
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // SÉCURITÉ : Si pas de clé, on ne fait pas planter l'app, on retourne null
  if (!apiKey) {
    console.warn("⚠️ Clé API OpenAI manquante dans le fichier .env");
    return {
      title: "Mode Démo",
      content: "Impossible de générer le texte car la clé API OpenAI n'est pas configurée. Veuillez ajouter VITE_OPENAI_API_KEY dans votre fichier .env.",
      image_keyword: "error 404 computer"
    };
  }

  // Configuration du Prompt Système
  const systemPrompt = `Tu es un expert en social media marketing.
  Ton client est : ${profile?.name || "Une entreprise locale"}.
  Ville : ${profile?.city || "France"}.
  
  Tâche : Rédige un post court, engageant et professionnel.
  Format de réponse OBLIGATOIRE en JSON :
  {
    "title": "Titre interne",
    "content": "Le texte du post ici avec des emojis",
    "image_keyword": "Description visuelle en anglais pour générer une image"
  }`;

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
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Gestion des erreurs renvoyées par OpenAI (ex: quota dépassé)
    if (data.error) {
      console.error("Erreur OpenAI API:", data.error);
      throw new Error(data.error.message);
    }

    const jsonContent = data.choices[0].message.content;
    
    // Tentative de lecture du JSON
    try {
      return JSON.parse(jsonContent);
    } catch (e) {
      // Si l'IA n'a pas renvoyé du JSON propre, on renvoie le texte brut
      return {
        title: "Nouveau Post",
        content: jsonContent,
        image_keyword: "business success"
      };
    }

  } catch (error) {
    console.error("Erreur critique OpenAI:", error);
    // On retourne un objet par défaut pour ne pas faire crasher l'interface
    return {
      title: "Erreur IA",
      content: "Une erreur est survenue lors de la génération. Vérifiez votre connexion ou votre clé API.",
      image_keyword: "network error"
    };
  }
}
