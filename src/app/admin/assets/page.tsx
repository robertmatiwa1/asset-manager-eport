"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

type AdminAsset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  categories: { name: string }[];
  departments: { name: string }[];
};

export default function AdminAssetsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
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
    setLoading(true);
    const { data } = await supabase
      .from("assets")
      .select("id, name, cost, date_purchased, categories(name), departments(name)")
      .order("created_at", { ascending: false });

    setAssets((data as AdminAsset[]) || []);
    setLoading(false);
  };

  if (!authorized) return <div className="p-6">Checking access...</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">All Assets</h1>

      {loading ? (
        <>
          <div className="bg-white p-4 shadow rounded h-24 animate-pulse"></div>
          <div className="bg-white p-4 shadow rounded h-24 animate-pulse"></div>
        </>
      ) : (
        assets.map((asset) => (
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
              onClick={() => openDelete(asset.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))
      )}

      {/* Delete Modal */}
      <Modal open={confirmDelete} title="Confirm Delete">
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
  );
}
