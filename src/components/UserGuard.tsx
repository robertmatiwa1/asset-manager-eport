"use client";

import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");

      // Only allow Users
      if (role !== "USER") return router.replace("/admin/dashboard");

      setAuthorized(true);
    };

    load();

    // Refresh when session changes (no refresh needed)
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!authorized) return <div className="p-6">Checking access...</div>;

  return <>{children}</>;
}
