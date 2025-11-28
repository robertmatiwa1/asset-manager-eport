"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    setCategories(data || []);
  };

  const addCategory = async () => {
    if (!name.trim()) return alert("Enter a category name");

    const { error } = await supabase.from("categories").insert([{ name }]);

    if (error) return alert("Error creating category");

    setName("");
    load();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-2xl font-semibold">Categories</h1>

        <div className="bg-white p-6 shadow rounded space-y-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addCategory}
          >
            Add Category
          </button>
        </div>

        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id}>
                <td className="px-3 py-2 border">{c.name}</td>
                <td className="px-3 py-2 border">
                  <button
                    className="text-red-500"
                    onClick={() => deleteCategory(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </AdminGuard>
  );
}
