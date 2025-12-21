import { supabase } from "./supabase";

export const generatePostContent = async (prompt, profile) => {
  // Simulation intelligente (En prod, on appellerait une Edge Function)
  // Ici, on force l'IA simulée à ne pas inventer de chiffres si non présents
  
  const hasNumbers = /\d/.test(prompt);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let content = "";
      
      // Logique de "Guardrail" (Garde-fou)
      if (prompt.toLowerCase().includes("promo") && !hasNumbers) {
         content = `🔥 Offre Spéciale chez ${profile?.name || "nous"} !\n\nProfitez de nos offres exceptionnelles dès aujourd'hui. Venez découvrir nos nouveautés en boutique.\n\n📍 ${profile?.city || "En ville"}`;
      } else {
         content = `${prompt}\n\nUne expérience unique vous attend chez ${profile?.name}. Qualité et service garantis !\n\n👉 Passez nous voir !`;
      }

      // Ajout automatique des hashtags
      const tags = `\n\n#${profile?.city?.replace(/\s/g,'') || "Local"} #${profile?.name?.replace(/\s/g,'') || "Business"} #Innovation #Offre`;

      resolve({
        title: "Post : " + prompt.substring(0, 20) + "...",
        content: content + tags,
        image_keyword: prompt.split(" ").slice(0, 3).join(" "),
        hashtags: tags // On renvoie aussi les tags séparément si besoin
      });
    }, 1500);
  });
};
