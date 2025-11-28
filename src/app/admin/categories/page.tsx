"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function CategoriesPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------
  // LOAD ROLE + DATA
  // ---------------------------------------------------
  useEffect(() => {
    const load = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorised(true);
      fetchCategories();
    };

    load();
  }, [router]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setCategories(data || []);
  };

  // ---------------------------------------------------
  // CREATE CATEGORY
  // ---------------------------------------------------
  const createCategory = async () => {
    if (!newCategory.trim()) return alert("Category name is required");

    setLoading(true);

    const { error } = await supabase
      .from("categories")
      .insert([{ name: newCategory.trim() }]);

    setLoading(false);

    if (error) {
      console.error(error);
      return alert("Failed to create category");
    }

    setNewCategory("");
    fetchCategories();
  };

  // ---------------------------------------------------
  // DELETE CATEGORY
  // ---------------------------------------------------
  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return alert("Failed to delete category");
    }

    fetchCategories();
  };

  if (!authorised)
    return <div className="p-8">Checking access…</div>;

  // ---------------------------------------------------
  // PAGE RENDER
  // ---------------------------------------------------
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Categories</h1>

      {/* CREATE NEW CATEGORY */}
      <section className="border rounded p-4 bg-gray-50 space-y-3">
        <h2 className="font-medium">Add New Category</h2>

        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button
          onClick={createCategory}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </section>

      {/* LIST CATEGORIES */}
      <section>
        <h2 className="font-medium mb-2">Existing Categories</h2>

        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Created</th>
                <th className="px-3 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 border">{c.name}</td>
                  <td className="px-3 py-2 border">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border">
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
