"use client";

import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Always read fresh session
const { data: sessionData } = await supabase.auth.getSession();
const sessionUser = sessionData?.session?.user || null;

// If session is gone → redirect immediately
if (!sessionUser) {
  router.replace("/login");
  return;
}

const { user, role } = await getCurrentUserAndRole();


      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
    };

    load();

    // Refresh on session change
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!authorized) return <div className="p-6">Checking access...</div>;

  return <>{children}</>;
}
