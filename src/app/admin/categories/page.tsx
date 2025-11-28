"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // Ensure the user is an Admin
  // ----------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorised(true);
      await loadCategories();
    };

    init();
  }, [router]);

  // ----------------------------
  // Load categories from Supabase
  // ----------------------------
  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    setCategories((data as Category[]) || []);
  };

  // ----------------------------
  // Add a new category
  // ----------------------------
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("categories")
      .insert({ name: newCategory.trim() });

    setLoading(false);

    if (error) {
      alert("Error creating category: " + error.message);
      return;
    }

    setNewCategory("");
    await loadCategories();
  };

  // ----------------------------
  // Delete a category
  // ----------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Cannot delete category. It might be used by an asset.");
      return;
    }

    await loadCategories();
  };

  if (!authorised) return <div className="p-8">Checking access…</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Categories</h1>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Category List */}
      <table className="min-w-full border rounded mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Category</th>
            <th className="border px-3 py-2 text-left">Created</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="border px-3 py-2">{cat.name}</td>
              <td className="border px-3 py-2">
                {new Date(cat.created_at).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2 text-center">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td className="border px-3 py-2 text-center" colSpan={3}>
                No categories yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
