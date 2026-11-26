import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://txulntnihkqvscxknoei.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dWxudG5paGtxdnNjeGtub2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MTQ4ODcsImV4cCI6MjA4NjI5MDg4N30.HmqhEUiSPhHmakbvXaQ2kLEN0zEqiT_FN8zKkgQrT1w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
