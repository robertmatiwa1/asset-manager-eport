import { supabase } from "./supabaseClient";

// Removed: import type { UserRole } from "./types";

export async function getCurrentUserAndRole() {
  const { data: userData } = await supabase.auth.getUser();

  const user = userData?.user;

  if (!user) return { user: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: profile?.role || null,
    fullName: profile?.full_name || "",
  };
}
