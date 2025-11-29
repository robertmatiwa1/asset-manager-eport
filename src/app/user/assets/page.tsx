"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UserAssetsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);

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

      setAuthorized(true);
      setUserId(user.id);

      Promise.all([loadCategories(), loadDepartments(), loadAssets(user.id)]).then(
        () => setLoading(false)
      );
    };

    init();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name");
    setCategories(data || []);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from("departments").select("id, name");
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

    setSaving(true);

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

    setSaving(false);

    if (error) return alert("Error creating asset: " + error.message);

    setForm({
      name: "",
      category_id: "",
      department_id: "",
      date_purchased: "",
      cost: "",
    });

    loadAssets(userId);
  };

  if (!authorized) return <div className="p-8">Checking access...</div>;

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Your Assets</h1>

      {/* NEW ASSET FORM */}
      <div className="bg-white p-6 shadow rounded space-y-4">
        <h2 className="text-xl font-semibold">Add New Asset</h2>

        {/* NAME */}
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Asset Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* CATEGORY */}
        <select
          className="border p-2 rounded w-full"
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          <option value="">Select Category</option>

          {loading ? (
            <option>Loading...</option>
          ) : (
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>

        {/* DEPARTMENT */}
        <select
          className="border p-2 rounded w-full"
          value={form.department_id}
          onChange={(e) => setForm({ ...form, department_id: e.target.value })}
        >
          <option value="">Select Department</option>

          {loading ? (
            <option>Loading...</option>
          ) : (
            departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))
          )}
        </select>

        {/* DATE */}
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={form.date_purchased}
          onChange={(e) =>
            setForm({ ...form, date_purchased: e.target.value })
          }
        />

        {/* COST */}
        <input
          type="number"
          className="border p-2 rounded w-full"
          placeholder="Cost"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />

        <button
          onClick={createAsset}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Add Asset"}
        </button>
      </div>

      {/* ASSET LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Asset List</h2>

        {loading ? (
          <>
            <div className="bg-white p-4 shadow rounded animate-pulse h-20"></div>
            <div className="bg-white p-4 shadow rounded animate-pulse h-20"></div>
          </>
        ) : assets.length === 0 ? (
          <p>No assets created yet.</p>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white p-4 shadow rounded flex justify-between"
            >
              <div>
                <div className="font-semibold">{asset.name}</div>
                <div className="text-sm text-gray-600">
                  {asset.categories?.name} — {asset.departments?.name}
                </div>
                <div className="text-sm">Purchased: {asset.date_purchased}</div>
                <div className="text-sm font-semibold">Cost: R {asset.cost}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
