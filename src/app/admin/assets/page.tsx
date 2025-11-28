"use client";

import { useEffect, useState } from "react";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminAssetsPage() {
  const router = useRouter();

  const [authorised, setAuthorised] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------
  // ROLE GUARD + LOAD ALL ASSETS
  // -----------------------------------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorised(true);
      loadAssets();
    };

    init();
  }, [router]);

  // Load all assets
  const loadAssets = async () => {
    const { data } = await supabase
      .from("assets")
      .select(`
        id,
        name,
        cost,
        date_purchased,
        profiles (full_name),
        categories (name),
        departments (name)
      `);

    setAssets(data || []);
  };

  // -----------------------------------------------------
  // DELETE ASSET
  // -----------------------------------------------------
  const deleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    setLoading(true);

    const { error } = await supabase.from("assets").delete().eq("id", id);

    setLoading(false);

    if (error) return alert("Could not delete asset.");

    loadAssets();
  };

  // -----------------------------------------------------
  // LOADING CHECK
  // -----------------------------------------------------
  if (!authorised) {
    return <div className="p-8">Checking access…</div>;
  }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">All Assets</h1>

      {/* Asset List */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Department</th>
              <th className="px-4 py-2 border">Cost</th>
              <th className="px-4 py-2 border">Purchased</th>
              <th className="px-4 py-2 border">Created By</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{a.name}</td>
                <td className="px-4 py-2 border">{a.categories?.name}</td>
                <td className="px-4 py-2 border">{a.departments?.name}</td>
                <td className="px-4 py-2 border">R {a.cost}</td>
                <td className="px-4 py-2 border">
                  {new Date(a.date_purchased).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{a.profiles?.full_name}</td>

                <td className="px-4 py-2 border">
                  <button
                    className="text-red-600 hover:underline"
                    disabled={loading}
                    onClick={() => deleteAsset(a.id)}
                  >
                    {loading ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {assets.length === 0 && (
              <tr>
                <td className="px-4 py-4 border text-center" colSpan={7}>
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
