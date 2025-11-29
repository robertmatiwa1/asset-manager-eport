"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/FullScreenLoader";
import Spinner from "@/components/Spinner";

export default function UserAssetsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    department_id: "",
    date_purchased: "",
    cost: "",
  });

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "USER") return router.replace("/admin/dashboard");

      setUserId(user.id);
      setAuthorized(true);

      loadCategories();
      loadDepartments();
      loadAssets(user.id);
    };

    init();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from("departments").select("*");
    setDepartments(data || []);
  };

  const loadAssets = async (uid: string) => {
    const { data } = await supabase
      .from("assets")
      .select("id, name, cost, date_purchased, categories(name), departments(name)")
      .eq("created_by", uid);

    setAssets(data || []);
  };

  const createAsset = async () => {
    if (!userId) return;

    setLoading(true);

    const { error } = await supabase.from("assets").insert([
      {
        name: form.name,
        category_id: form.category_id,
        department_id: form.department_id,
        date_purchased: form.date_purchased,
        cost: form.cost,
        created_by: userId,
      },
    ]);

    setLoading(false);

    if (error) return alert(error.message);

    setForm({
      name: "",
      category_id: "",
      department_id: "",
      date_purchased: "",
      cost: "",
    });

    loadAssets(userId);
  };

  if (!authorized) return <FullScreenLoader />;

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Your Assets</h1>

      <div className="bg-white p-6 shadow rounded space-y-4">
        <h2 className="text-xl font-semibold">Add New Asset</h2>

        <input
          className="border p-2 rounded w-full"
          placeholder="Asset Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 rounded w-full"
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded w-full"
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded w-full"
          value={form.date_purchased}
          onChange={(e) => setForm({ ...form, date_purchased: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 rounded w-full"
          placeholder="Cost"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />

        <button
          onClick={createAsset}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
        >
          {loading && <Spinner />}
          {loading ? "Saving..." : "Add Asset"}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Asset List</h2>

        {assets.length === 0 && <p>No assets created yet.</p>}

        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white p-4 shadow rounded flex justify-between"
          >
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-gray-600 text-sm">
                {asset.categories?.name} — {asset.departments?.name}
              </div>
              <div className="text-sm">
                Purchased: {asset.date_purchased}
              </div>
              <div className="text-sm font-semibold">
                Cost: R {asset.cost}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
