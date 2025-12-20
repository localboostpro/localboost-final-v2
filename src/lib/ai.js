// src/lib/ai.js

const GEMINI_KEY = "AIzaSyCy_7QOHhxcvLMfE9BPZFh6X-xIn2kPMCU";

export const generateContent = async (profile, theme) => {
  const prompt = `Génère un post marketing pour "${profile.name}" (${profile.type}) à ${profile.location}.
Thème: ${theme}.
Format JSON strict uniquement, sans texte autour :
{"title":"Titre","content":"Contenu"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API Google: ${response.status}`);
    }

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Réponse IA vide ou invalide");
    }

    // Extraction du JSON même si Gemini ajoute du texte autour
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("JSON non trouvé dans la réponse IA");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("⚠️ IA indisponible, mode secours activé:", error);

    return {
      title: `${theme} chez ${profile.name || "nous"} !`,
      content: `Découvrez nos offres exceptionnelles sur le thème ${theme}. Venez nous voir à ${
        profile.location || "notre établissement"
      } !`,
    };
  }
};
