import { supabase } from "./supabaseClient";

export async function getCurrentUserAndRole() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null, profile: null };

  // Load profile from table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: profile?.role || null,
    profile,
  };
}
