"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({
    assets: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "USER") return router.replace("/admin/dashboard");

      setAuthorized(true);
      loadStats(user.id);
    };

    init();
  }, [router]);

  const loadStats = async (userId: string) => {
    const { data: assets } = await supabase
      .from("assets")
      .select("id, cost")
      .eq("user_id", userId);  
    const totalValue = assets?.reduce((acc, asset) => acc + Number(asset.cost), 0) || 0;

    setStats({
      assets: assets?.length || 0,
      totalValue,
    });
  };

  if (!authorized) return <FullScreenLoader/>;

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">Your Assets</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Assets */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Your Total Assets</div>
          <div className="text-3xl font-bold">{stats.assets}</div>
        </div>

        {/* Total Asset Value */}
        <div className="p-6 bg-white shadow rounded">
          <div className="text-gray-600">Total Value</div>
          <div className="text-3xl font-bold">R {stats.totalValue.toFixed(2)}</div>
        </div>
      </div>
    </main>
  );
}
