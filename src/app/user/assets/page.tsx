"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getCurrentUserAndRole } from "@/lib/auth";

type Asset = {
  id: string;
  name: string;
  cost: number;
  date_purchased: string;
  created_at: string;
  categories: { name: string } | null;
  departments: { name: string } | null;
};

export default function UserAssetsPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // ----------------------------------------
  // Ensure USER role and fetch assets
  // ----------------------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "USER") return router.replace("/admin/dashboard");

      setAuthorised(true);
      setUserId(user.id);
      await loadAssets(user.id);
    };

    init();
  }, [router]);

  // ----------------------------------------
  // Load assets belonging ONLY to this user
  // ----------------------------------------
  const loadAssets = async (id: string) => {
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
        departments(name)
      `
      )
      .eq("created_by", id)
      .order("created_at", { ascending: false });

    setAssets((data as Asset[]) || []);
  };

  if (!authorised) return <div className="p-8">Loading…</div>;

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Assets</h1>

        <button
          onClick={() => router.push("/user/assets/new")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Asset
        </button>
      </div>

      <table className="min-w-full border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Name</th>
            <th className="border px-3 py-2 text-left">Category</th>
            <th className="border px-3 py-2 text-left">Department</th>
            <th className="border px-3 py-2 text-left">Cost</th>
            <th className="border px-3 py-2 text-left">Purchased</th>
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
            </tr>
          ))}

          {assets.length === 0 && (
            <tr>
              <td className="border px-3 py-2 text-center" colSpan={5}>
                You have not created any assets yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
