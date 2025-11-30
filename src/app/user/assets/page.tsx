"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import UserGuard from "@/components/UserGuard";

type UserAsset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  categories: { name: string }[];
  departments: { name: string }[];
};

export default function UserAssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { user } = await getCurrentUserAndRole();
      if (!user) return;

      const { data } = await supabase
        .from("assets")
        .select("id, name, cost, date_purchased, categories(name), departments(name)")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      setAssets((data as UserAsset[]) || []);
      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <UserGuard>
      <main className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">My Assets</h1>

        {loading ? (
          <div className="text-gray-600">Loading your assets...</div>
        ) : assets.length === 0 ? (
          <div className="text-gray-600">You have not created any assets yet.</div>
        ) : (
          <div className="space-y-4">
            {assets.map((a) => (
              <div key={a.id} className="bg-white shadow p-4 rounded">
                <h2 className="text-xl font-semibold">{a.name}</h2>
                <p className="text-gray-600">
                  {a.categories?.[0]?.name} — {a.departments?.[0]?.name}
                </p>
                <p>Date Purchased: {a.date_purchased}</p>
                <p>Cost: R {a.cost}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </UserGuard>
  );
}
