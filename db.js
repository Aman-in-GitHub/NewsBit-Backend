import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export const kam_supabase = createClient(
  process.env.KAM_SUPABASE_URL,
  process.env.KAM_SUPABASE_ANON_KEY,
);

export const vibes_supabase = createClient(
  process.env.VIBES_SUPABASE_URL,
  process.env.VIBES_SUPABASE_ANON_KEY,
);
