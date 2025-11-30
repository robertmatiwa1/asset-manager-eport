"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    assets: 0,
    categories: 0,
    departments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: users } = await supabase.from("profiles").select("id");
      const { data: assets } = await supabase.from("assets").select("id");
      const { data: categories } = await supabase.from("categories").select("id");
      const { data: departments } = await supabase.from("departments").select("id");

      setStats({
        users: users?.length || 0,
        assets: assets?.length || 0,
        categories: categories?.length || 0,
        departments: departments?.length || 0,
      });

      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AdminGuard>
      <main className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

        {loading ? (
          <div className="text-gray-600">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card label="Total Users" value={stats.users} />
            <Card label="Total Assets" value={stats.assets} />
            <Card label="Categories" value={stats.categories} />
            <Card label="Departments" value={stats.departments} />
          </div>
        )}
      </main>
    </AdminGuard>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 shadow rounded">
      <div className="text-gray-600">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
