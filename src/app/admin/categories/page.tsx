"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      setCategories((data as Category[]) || []);
      setLoading(false);
    };

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return alert("Enter a category name");
    setSaving(true);

    await supabase.from("categories").insert([{ name }]);
    setSaving(false);
    setName("");

    // refresh
    const { data } = await supabase.from("categories").select("*");
    setCategories((data as Category[]) || []);
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Manage Categories</h1>

        {/* Add */}
        <div className="bg-white p-6 shadow rounded space-y-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addCategory}
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Category"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div>Loading categories…</div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.id} className="bg-white p-4 shadow rounded">
                <div className="font-semibold">{c.name}</div>
                <div className="text-gray-600 text-sm">{c.created_at}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AdminGuard>
  );
}
