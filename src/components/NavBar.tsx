"use client";

import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load current user + role
  useEffect(() => {
    const load = async () => {
      const { role } = await getCurrentUserAndRole();
      setRole(role);
      setInitialized(true);
    };

    load();

    // Watch for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setRole(null);
        router.push("/login");
        setTimeout(() => window.location.replace("/login"), 30);
        return;
      }
      load();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    // Reset UI instantly
    setRole(null);

    router.push("/login");

    // Hard refresh to kill stale session
    setTimeout(() => window.location.replace("/login"), 30);
  };

  // Hide nav on login page
  if (pathname === "/login" || !initialized) return null;

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="font-semibold">Asset Manager</div>

      <div className="flex gap-6 text-sm">
        {role === "ADMIN" && (
          <>
            <button onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
            <button onClick={() => router.push("/admin/users")}>Users</button>
            <button onClick={() => router.push("/admin/categories")}>Categories</button>
            <button onClick={() => router.push("/admin/departments")}>Departments</button>
            <button onClick={() => router.push("/admin/assets")}>Assets</button>
          </>
        )}

        {role === "USER" && (
          <>
            <button onClick={() => router.push("/user/dashboard")}>My Dashboard</button>
            <button onClick={() => router.push("/user/assets")}>My Assets</button>
          </>
        )}

        <button onClick={handleLogout} className="text-red-600 font-medium hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}
