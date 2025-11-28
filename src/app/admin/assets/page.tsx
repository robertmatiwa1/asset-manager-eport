"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
  const [assets, setAssets] = useState<AdminAsset[]>([]);

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();
      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      loadAssets();
    };

    init();
  }, []);

  const loadAssets = async () => {
    const { data, error } = await supabase
      .from("assets")
      .select(
        "id, name, cost, date_purchased, categories(name), departments(name), profiles(full_name)"
      )
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setAssets((data as AdminAsset[]) || []);
  };

  const deleteAsset = async (id: string) => {
    await supabase.from("assets").delete().eq("id", id);
    loadAssets();
  };

  if (!authorized) return <div className="p-6">Checking access...</div>;

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
            <p>Owner: {asset.profiles?.[0]?.full_name || "Unknown"}</p>
            <p>Date: {asset.date_purchased}</p>
            <p>Cost: R {asset.cost}</p>
          </div>

          <button
            onClick={() => deleteAsset(asset.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
