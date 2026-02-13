// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Leemos las variables desde el archivo .env usando import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad en consola (solo aparecerá si algo falta)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Faltan variables de entorno en el archivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
