"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoader from "@/components/AdminLoader";

type AdminAsset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  categories: { name: string }[];
  departments: { name: string }[];
  profiles: { full_name: string }[];
};

export default function AdminAssetsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [assets, setAssets] = useState<AdminAsset[]>([]);

  const loadAssets = async () => {
    const { data, error } = await supabase
      .from("assets")
      .select("id, name, cost, date_purchased, categories(name), departments(name), profiles(full_name)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setAssets((data as AdminAsset[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      await loadAssets();
      setLoading(false);
    };

    init();
  }, []);

  if (!authorized || loading) return <AdminLoader />;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">All Assets</h1>

      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-white shadow p-4 rounded flex justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold">{asset.name}</h2>
            <p className="text-gray-600">
              {asset.categories?.[0]?.name} — {asset.departments?.[0]?.name}
            </p>
            <p>Date: {asset.date_purchased}</p>
            <p>Cost: R {asset.cost}</p>
          </div>

          <button
            onClick={async () => {
              await supabase.from("assets").delete().eq("id", asset.id);
              loadAssets();
            }}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
