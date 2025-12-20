import { createClient } from "@supabase/supabase-js";

// Remplacez ces valeurs par les vôtres (disponibles dans Supabase > Settings > API)
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://eayaxxljykfjnmvcbcex.supabase.co";
const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheWF4eGxqeWtmam5tdmNiY2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjg3OTcsImV4cCI6MjA4MTY0NDc5N30.lSh3PmPiN2k2XXtdWvUaUGxYNcqNCS4B0NZvdDJhwnM";

export const supabase = createClient(supabaseUrl, supabaseKey);
