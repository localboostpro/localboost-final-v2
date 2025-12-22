// On sécurise l'accès à la clé (évite les bugs si undefined)
const RAW_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const generatePostContent = async (prompt, profile) => {
  console.log("👉 ÉTAPE 1: Démarrage IA");

  // Sécurité 1: On vérifie que la clé existe
  if (!RAW_KEY) {
    console.error("❌ CLÉ MANQUANTE sur Vercel");
    throw new Error("Clé API manquante. Ajoutez VITE_OPENAI_API_KEY dans Vercel.");
  }

  // Sécurité 2: On force la conversion en texte et on enlève les espaces invisibles
  const apiKey = String(RAW_KEY).trim();
  console.log("👉 ÉTAPE 2: Clé détectée (longueur: " + apiKey.length + ")");

  const businessName = profile?.name || "Pro";
  const businessCity = profile?.city || "France";

  try {
    console.log("👉 ÉTAPE 3: Envoi requête OpenAI...");
    
    // Sécurité 3: On utilise window.fetch pour être sûr d'utiliser le navigateur
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
            content: `Expert marketing pour ${businessName} à ${businessCity}. Réponds en JSON: { "title": "...", "content": "...", "hashtags": [], "image_keyword": "..." }`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    console.log("👉 ÉTAPE 4: Réponse reçue (Statut: " + response.status + ")");

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Erreur API:", err);
      throw new Error("Erreur OpenAI: " + (err.error?.message || response.statusText));
    }

    const data = await response.json();
    const contentRaw = data.choices[0].message.content;

    // Parsing JSON sécurisé
    let parsed;
    try {
        parsed = JSON.parse(contentRaw);
    } catch (e) {
        return { title: "Post IA", content: contentRaw, image_keyword: "business" };
    }

    return {
      title: parsed.title,
      content: parsed.content + "\n\n" + (parsed.hashtags?.join(" ") || ""),
      image_keyword: parsed.image_keyword
    };

  } catch (error) {
    console.error("❌ CRASH:", error);
    throw error;
  }
};

// DOUBLE EXPORT (Pour éviter l'erreur "r is not a function")
export { generatePostContent };
export default generatePostContent;
