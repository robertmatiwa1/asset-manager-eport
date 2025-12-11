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
  warrantyRegistered?: boolean;
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Warranty registration state
  const [registeringId, setRegisteringId] = useState<string | null>(null);

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

    if (error) {
      console.error("Error loading assets", error);
      setLoading(false);
      return;
    }

    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      cost: a.cost,
      date_purchased: a.date_purchased,
      categories: a.categories,
      departments: a.departments,
      profiles: a.profiles,
      warrantyRegistered: false,
    }));

    setAssets(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const registerWarranty = async (asset: AdminAsset) => {
    try {
      setRegisteringId(asset.id);

      const res = await fetch("/api/register-warranty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_id: asset.id,
          asset_name: asset.name,
          registered_by: asset.profiles?.full_name || "admin@eport.local",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Warranty API error", data);
        alert(data.detail || data.message || "Failed to register warranty");
        return;
      }

      // Mark this asset as having a registered warranty
      setAssets((prev) =>
        prev.map((a) =>
          a.id === asset.id ? { ...a, warrantyRegistered: true } : a
        )
      );

      alert("Warranty registered successfully!");
    } catch (err) {
      console.error("Error registering warranty", err);
      alert("Unexpected error registering warranty");
    } finally {
      setRegisteringId(null);
    }
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

                  <p className="mt-1 text-sm">
                    Status:{" "}
                    <span
                      className={
                        asset.warrantyRegistered
                          ? "text-green-700 font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {asset.warrantyRegistered
                        ? "Warranty Registered"
                        : "Warranty Not Registered"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {!asset.warrantyRegistered && (
                    <button
                      onClick={() => registerWarranty(asset)}
                      disabled={registeringId === asset.id}
                      className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {registeringId === asset.id
                        ? "Registering..."
                        : "Register Warranty"}
                    </button>
                  )}

                  <button
                    onClick={() => openDelete(asset.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
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
