"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoader from "@/components/AdminLoader";

export default function AdminDashboard() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalAssets: 0,
    totalCategories: 0,
    totalDepartments: 0,
    totalUsers: 0,
  });

  const loadStats = async () => {
    const [assets, categories, departments, users] = await Promise.all([
      supabase.from("assets").select("id"),
      supabase.from("categories").select("id"),
      supabase.from("departments").select("id"),
      supabase.from("profiles").select("id"),
    ]);

    setStats({
      totalAssets: assets.data?.length || 0,
      totalCategories: categories.data?.length || 0,
      totalDepartments: departments.data?.length || 0,
      totalUsers: users.data?.length || 0,
    });
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      await loadStats();
      setLoading(false);
    };

    init();
  }, []);

  if (!authorized || loading) return <AdminLoader />;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Total Assets" value={stats.totalAssets} />
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Categories" value={stats.totalCategories} />
        <StatCard label="Departments" value={stats.totalDepartments} />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-6 bg-white shadow rounded">
      <div className="text-gray-600 text-sm">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
