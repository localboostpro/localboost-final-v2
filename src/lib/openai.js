// ⚠️ COLLEZ VOTRE VRAIE CLÉ ICI ENTRE LES GUILLEMETS
const OPENAI_API_KEY =
  "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";

export const generatePostContent = async (userPrompt, profile) => {
  console.log("🚀 Démarrage Génération IA...");

  // 1. VÉRIFICATION DE LA CLÉ
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("sk-proj-....")) {
    alert(
      "⛔️ STOP : Vous n'avez pas collé votre clé API dans le fichier src/lib/openai.js !"
    );
    return null;
  }

  // 2. GESTION DU PROFIL (Anti-Crash)
  // Si le profil n'est pas chargé, on utilise le nom que vous aviez dans votre fichier CSV.
  const nom = profile?.name || "Webgraphicdesign";
  const activite = profile?.type || profile?.activity || "Agence Digitale";

  // 3. LE PROMPT "HOSTINGER STYLE" (Méthode AIDA)
  // C'est ce prompt précis qui donne la qualité "Pro".
  const systemPrompt = `
    Tu es un Expert Copywriter Marketing (Niveau Hostinger/Jasper).
    CLIENT : "${nom}" (${activite}).
    
    OBJECTIF : Rédiger un post viral structuré selon la méthode A.I.D.A.
    
    STRUCTURE OBLIGATOIRE :
    1. ACCROCHE (Attention) : Une phrase choc ou une question avec un emoji.
    2. INTÉRÊT : Développe le problème ou le besoin du client.
    3. DÉSIR : Présente "${nom}" comme la solution idéale.
    4. ACTION : Un appel à l'action clair (CTA).

    RÈGLES :
    - Langue : FRANÇAIS EXCELLENT (Pas de fautes, style fluide).
    - Nom : Cite "${nom}" au moins une fois.
    - Image : Fournis un prompt EN ANGLAIS pour générer une image photoréaliste (ex: "Professional modern office workspace, cinematic lighting, 4k").

    FORMAT DE SORTIE (JSON) :
    {
      "title": "Titre court et punchy",
      "content": "Le texte complet structuré...",
      "image_keyword": "Description visuelle en ANGLAIS"
    }
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Le meilleur rapport qualité/prix
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Sujet du post : "${userPrompt}"` },
        ],
        temperature: 0.8, // Un peu de créativité
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    // 4. DIAGNOSTIC PRÉCIS EN CAS D'ERREUR
    if (data.error) {
      console.error("ERREUR OPENAI :", data.error);
      alert(`❌ Erreur IA : ${data.error.message}`);
      return null;
    }

    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error("Erreur Technique :", error);
    alert("❌ Erreur Technique (Réseau/Code) : " + error.message);
    return null;
  }
};
