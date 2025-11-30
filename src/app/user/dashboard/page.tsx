"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import UserGuard from "@/components/UserGuard";

type UserStats = {
  assets: number;
  totalValue: number;
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    assets: 0,
    totalValue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { user } = await getCurrentUserAndRole();
      if (!user) return;

      const { data: assets } = await supabase
        .from("assets")
        .select("id, cost")
        .eq("created_by", user.id);

      const totalValue =
        assets?.reduce((acc, x) => acc + Number(x.cost), 0) || 0;

      setStats({
        assets: assets?.length || 0,
        totalValue,
      });

      setLoading(false);
    };

    load();

    // Refresh on login / logout / token change
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <UserGuard>
      <main className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Your Dashboard</h1>

        {loading ? (
          <div className="text-gray-600">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white shadow rounded">
              <div className="text-gray-600">Your Total Assets</div>
              <div className="text-3xl font-bold">{stats.assets}</div>
            </div>

            <div className="p-6 bg-white shadow rounded">
              <div className="text-gray-600">Total Value</div>
              <div className="text-3xl font-bold">R {stats.totalValue.toFixed(2)}</div>
            </div>
          </div>
        )}
      </main>
    </UserGuard>
  );
}
