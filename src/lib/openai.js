// src/lib/openai.js

export const generatePostContent = async (fullPrompt, profile) => {
  // Simulation d'un délai de réflexion (comme une vraie IA)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);

  // 1. ANALYSE DU PROMPT (Simulation de compréhension)
  const promptLower = fullPrompt.toLowerCase();
  
  // Détection du sujet
  const isBurger = promptLower.includes("burger") || promptLower.includes("manger") || promptLower.includes("food");
  const isPromo = promptLower.includes("promo") || promptLower.includes("offre") || promptLower.includes("%");
  const isEvent = promptLower.includes("événement") || promptLower.includes("soirée");
  
  // Détection du ton
  const isFunny = promptLower.includes("drôle") || promptLower.includes("amical");
  const isUrgent = promptLower.includes("urgent");

  // 2. GÉNÉRATION INTELLIGENTE (Templates dynamiques)
  let title = "";
  let content = "";
  let imageKeyword = "";

  // SCÉNARIO 1 : BURGER / FOOD 🍔
  if (isBurger) {
    imageKeyword = "burger gourmet food porn";
    title = "🍔 Alerte Tuerie !";
    
    if (isFunny) {
      content = `Arrêtez de baver sur votre écran, c'est gênant... 🤤\n\nNotre nouveau Burger est arrivé et il est plus sexy que votre ex. Pain brioché, steak haché minute et cette sauce... mon dieu cette sauce !\n\nVenez tester avant qu'on mange tout le stock nous-mêmes.`;
    } else if (isPromo) {
      content = `🔥 OFFRE GOURMANDE !\n\nEnvie d'un vrai bon burger ? Cette semaine, profitez de -20% sur toute la carte le midi.\n\nFait maison, produits frais et amour garanti.`;
    } else {
      content = `Le bonheur tient en deux mains (et beaucoup de fromage). 🧀\n\nDécouvrez notre dernière création en édition limitée. C'est le moment de se faire plaisir chez ${profile?.name || "nous"}.`;
    }
  } 
  
  // SCÉNARIO 2 : PROMO GÉNÉRIQUE 🏷️
  else if (isPromo) {
    imageKeyword = "shopping discount happy";
    title = "⚡ Flash Promo";
    
    if (isUrgent) {
      content = `🚨 DERNIÈRE CHANCE !\n\nPlus que 24h pour profiter de nos offres exceptionnelles. Ne ratez pas ça, après il sera trop tard (et vous allez regretter).`;
    } else {
      content = `C'est le moment ou jamais ! 🎁\n\nOn a décidé de vous gâter avec une offre spéciale. Passez nous voir en boutique pour en profiter.\n\n📍 ${profile?.city || "En ville"}`;
    }
  }

  // SCÉNARIO 3 : PAR DÉFAUT (Générique mais propre)
  else {
    imageKeyword = "business lifestyle professional";
    title = "Quoi de neuf ?";
    content = `✨ Du nouveau chez ${profile?.name || "votre commerçant"} !\n\nNous travaillons dur pour vous offrir le meilleur service possible. Venez découvrir nos nouveautés et échanger avec notre équipe passionnée.\n\nOn vous attend avec le sourire ! 👋`;
  }

  // 3. CONSTRUCTION FINALE
  // On ajoute les hashtags à la fin, proprement.
  const hashtags = `\n\n#${profile?.city?.replace(/\s/g, '') || "Local"} #${profile?.name?.replace(/\s/g, '') || "Business"} #BonPlan #Nouveauté`;

  return {
    title: title,
    content: content + hashtags,
    image_keyword: imageKeyword,
    hashtags: hashtags
  };
};
