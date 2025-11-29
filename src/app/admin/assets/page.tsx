"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import Modal from "@/components/Modal";

type AdminAsset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  categories?: { name: string } | null;
  departments?: { name: string } | null;
  profiles?: { full_name: string } | null;
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDelete = (id: string) => {
    setSelectedId(id);
    setConfirmDelete(true);
  };

  const doDelete = async () => {
    if (!selectedId) return;

    await supabase.from("assets").delete().eq("id", selectedId);

    setConfirmDelete(false);
    setSelectedId(null);
    loadAssets();
  };

  // Load all assets
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("assets")
      .select(`
        id,
        name,
        cost,
        date_purchased,
        categories ( name ),
        departments ( name ),
        profiles ( full_name )
      `)
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    // Supabase returns nested objects (not arrays)
    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      cost: a.cost,
      date_purchased: a.date_purchased,
      categories: a.categories,
      departments: a.departments,
      profiles: a.profiles,
    }));

    setAssets(mapped as AdminAsset[]);
    setLoading(false);
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-3xl font-semibold">All Assets</h1>

        <div className="space-y-4">
          {loading ? (
            <>
              <div className="bg-white p-4 shadow rounded h-20 animate-pulse" />
              <div className="bg-white p-4 shadow rounded h-20 animate-pulse" />
            </>
          ) : assets.length === 0 ? (
            <p>No assets found.</p>
          ) : (
            assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white p-4 shadow rounded flex justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{asset.name}</h2>

                  <p className="text-gray-600 text-sm">
                    {asset.categories?.name} — {asset.departments?.name}
                  </p>

                  <p className="text-sm">
                    Owner: {asset.profiles?.full_name || "Unknown"}
                  </p>

                  <p>Purchased: {asset.date_purchased}</p>
                  <p className="font-semibold">Cost: R {asset.cost}</p>
                </div>

                <button
                  onClick={() => openDelete(asset.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Delete confirmation modal */}
        <Modal open={confirmDelete} title="Delete Asset?">
          <p>Are you sure you want to delete this asset?</p>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              onClick={doDelete}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </Modal>
      </main>
    </AdminGuard>
  );
}
