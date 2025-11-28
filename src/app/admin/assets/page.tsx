"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("assets")
      .select("id, name, cost, date_purchased, categories(name), departments(name), profiles(full_name)")
      .order("created_at", { ascending: false });

    setAssets(data || []);
  };

  const deleteAsset = async (id: string) => {
    await supabase.from("assets").delete().eq("id", id);
    load();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-2xl font-semibold">All Assets</h1>

        {assets.length === 0 && <p>No assets recorded yet.</p>}

        <div className="space-y-4">
          {assets.map((asset: any) => (
            <div
              key={asset.id}
              className="bg-white p-4 rounded shadow flex justify-between"
            >
              <div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-gray-600">
                  {asset.categories?.name} — {asset.departments?.name}
                </div>
                <div className="text-sm">
                  By: {asset.profiles?.full_name}
                </div>
                <div className="text-sm">Purchased: {asset.date_purchased}</div>
                <div className="font-semibold">R {asset.cost}</div>
              </div>

              <button
                className="text-red-600"
                onClick={() => deleteAsset(asset.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </AdminGuard>
  );
}
