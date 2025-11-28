import { supabase } from "./supabaseClient";
import type { UserRole } from "./types";

export async function getCurrentUserAndRole() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return { user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  return { user: userData.user, role: profile?.role || null };
}
