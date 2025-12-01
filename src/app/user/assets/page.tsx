"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function UserAssetsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [assets, setAssets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true); // FIXED
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    department_id: "",
    date_purchased: "",
    cost: "",
  });

  // ---------------------------
  // INITIAL PAGE LOAD
  // ---------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "USER") return router.replace("/admin/dashboard");

      setUserId(user.id);

      const [catRes, depRes, assetRes] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("departments").select("id, name"),
        supabase
          .from("assets")
          .select("id, name, cost, date_purchased, categories(name), departments(name)")
          .eq("created_by", user.id),
      ]);

      setCategories(catRes.data || []);
      setDepartments(depRes.data || []);
      setAssets(assetRes.data || []);

      setAuthorized(true);
      setLoading(false);
    };

    init();
  }, []);

  // ---------------------------
  // CREATE ASSET
  // ---------------------------
  const createAsset = async () => {
    setSaving(true);

    const { data: sessionData } = await supabase.auth.getUser();
    const activeUser = sessionData?.user;

    if (!activeUser) {
      alert("Your session expired. Please log in again.");
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("assets").insert([
      {
        name: form.name,
        category_id: form.category_id,
        department_id: form.department_id,
        date_purchased: form.date_purchased,
        cost: Number(form.cost),
        created_by: activeUser.id,
      },
    ]);

    setSaving(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    // Clear form
    setForm({
      name: "",
      category_id: "",
      department_id: "",
      date_purchased: "",
      cost: "",
    });

    // Reload assets
    const { data } = await supabase
      .from("assets")
      .select("id, name, cost, date_purchased, categories(name), departments(name)")
      .eq("created_by", activeUser.id);

    setAssets(data || []);
  };

  // ---------------------------
  // UI RENDERING
  // ---------------------------
  if (!authorized || loading) {
    return <div className="p-6 text-center text-gray-700">Loading your assets...</div>;
  }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">My Assets</h1>

      {/* CREATE ASSET FORM */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">Add New Asset</h2>

        {categories.length === 0 && (
          <p className="text-red-600">⚠ No categories available. Admin must create some.</p>
        )}

        {departments.length === 0 && (
          <p className="text-red-600">⚠ No departments available. Admin must create some.</p>
        )}

        <input
          type="text"
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
          className="bg-black text-white px-4 py-2 rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Add Asset"}
        </button>
      </div>

      {/* ASSET LIST */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Assets</h2>

        {assets.length === 0 && <p>You haven't created any assets yet.</p>}

        {assets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white p-4 shadow rounded border flex justify-between"
          >
            <div>
              <div className="font-semibold">{asset.name}</div>
              <div className="text-sm text-gray-600">
                {asset.categories?.name} — {asset.departments?.name}
              </div>
              <div className="text-sm text-gray-700">
                Purchased: {asset.date_purchased}
              </div>
              <div className="text-sm font-semibold">Cost: ${asset.cost}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
