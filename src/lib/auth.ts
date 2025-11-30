"use server";

import { supabase } from "./supabaseClient";

export async function getCurrentUserAndRole() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  // Get role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: profile?.role || null,
  };
}
