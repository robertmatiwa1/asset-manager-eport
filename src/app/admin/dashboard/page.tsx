"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const [authorised, setAuthorised] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    assets: 0,
    categories: 0,
    departments: 0,
    totalValue: 0,
  });

  // ----------------------------
  // Authorize admin and load stats
  // ----------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorised(true);

      await loadStats();
    };

    init();
  }, [router]);

  const loadStats = async () => {
    const [{ count: userCount }, { count: assetCount }, { data: categories }, { data: departments }, { data: assetValues }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("assets").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("id"),
      supabase.from("departments").select("id"),
      supabase.from("assets").select("cost"),
    ]);

    const totalValue = assetValues?.reduce((sum: number, a: any) => sum + Number(a.cost), 0) || 0;

    setStats({
      users: userCount || 0,
      assets: assetCount || 0,
      categories: categories?.length || 0,
      departments: departments?.length || 0,
      totalValue,
    });
  };

  if (!authorised) return <div className="p-8">Checking access...</div>;

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Total Users</div>
          <div className="text-3xl font-bold">{stats.users}</div>
        </div>

        {/* Assets */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Total Assets</div>
          <div className="text-3xl font-bold">{stats.assets}</div>
        </div>

        {/* Categories */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Categories</div>
          <div className="text-3xl font-bold">{stats.categories}</div>
        </div>

        {/* Departments */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Departments</div>
          <div className="text-3xl font-bold">{stats.departments}</div>
        </div>

        {/* Total asset value */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Total Asset Value</div>
          <div className="text-3xl font-bold">R {stats.totalValue.toFixed(2)}</div>
        </div>
      </div>
    </main>
  );
}
