"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";

type Asset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  created_at: string;

  categories: { name: string } | null;
  departments: { name: string } | null;
  profiles: { full_name: string } | null;
};

export default function AdminAssetsPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  // ----------------------------
  // Ensure the user is an Admin
  // ----------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorised(true);
      await loadAssets();
    };

    init();
  }, [router]);

  // ----------------------------
  // Load all assets with joins
  // ----------------------------
  const loadAssets = async () => {
    const { data } = await supabase
      .from("assets")
      .select(
        `
        id,
        name,
        cost,
        date_purchased,
        created_at,
        categories(name),
        departments(name),
        profiles(full_name)
      `
      )
      .order("created_at", { ascending: false });

    setAssets((data as Asset[]) || []);
  };

  // ----------------------------
  // Delete an asset
  // ----------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    const { error } = await supabase.from("assets").delete().eq("id", id);

    if (error) {
      alert("Could not delete asset.");
      return;
    }

    await loadAssets();
  };

  if (!authorised) return <div className="p-8">Checking access…</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Assets</h1>
      <p className="text-gray-600 text-sm">
        View and manage all assets created by all users.
      </p>

      <table className="min-w-full border rounded mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Name</th>
            <th className="border px-3 py-2 text-left">Category</th>
            <th className="border px-3 py-2 text-left">Department</th>
            <th className="border px-3 py-2 text-left">Cost</th>
            <th className="border px-3 py-2 text-left">Purchased</th>
            <th className="border px-3 py-2 text-left">Created By</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td className="border px-3 py-2">{a.name}</td>
              <td className="border px-3 py-2">{a.categories?.name}</td>
              <td className="border px-3 py-2">{a.departments?.name}</td>
              <td className="border px-3 py-2">R {a.cost.toFixed(2)}</td>
              <td className="border px-3 py-2">
                {new Date(a.date_purchased).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2">{a.profiles?.full_name}</td>

              <td className="border px-3 py-2 text-center">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(a.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {assets.length === 0 && (
            <tr>
              <td className="border px-3 py-2 text-center" colSpan={7}>
                No assets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
