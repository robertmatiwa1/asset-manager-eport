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

  // Load current user + role for nav visibility
  useEffect(() => {
    const load = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) {
        setInitialized(true);
        return; // No user logged in
      }

      setRole(role);
      setInitialized(true);
    };

    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!initialized) return null;

  // Hide nav on login page
  if (pathname === "/login") return null;

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="font-semibold">Asset Manager</div>

      {/* Dynamic links depending on user role */}
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

        <button
          onClick={handleLogout}
          className="text-red-600 font-medium hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
