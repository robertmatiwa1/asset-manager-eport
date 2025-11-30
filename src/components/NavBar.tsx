"use client";

import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load role + watch for auth changes
  useEffect(() => {
    const load = async () => {
      const resp = await getCurrentUserAndRole();
      setUserRole(resp.role);
      setInitialized(true);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load(); // refresh role after login/logout
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Hide navbar on login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    router.replace("/login");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="font-semibold">Asset Manager</div>

      <div className="flex gap-6 text-sm">
        {userRole === "ADMIN" && (
          <>
            <button onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
            <button onClick={() => router.push("/admin/users")}>Users</button>
            <button onClick={() => router.push("/admin/categories")}>Categories</button>
            <button onClick={() => router.push("/admin/departments")}>Departments</button>
            <button onClick={() => router.push("/admin/assets")}>Assets</button>
          </>
        )}

        {userRole === "USER" && (
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
