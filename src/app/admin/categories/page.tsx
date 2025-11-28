"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  // FIX: Explicitly type the useState hook
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();
      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      loadCategories();
    };

    init();
  }, [router]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading categories:", error);
      return;
    }

    // FIX: This should now work without type errors
    setCategories(data || []);
  };

  const addCategory = async () => {
    if (!name.trim()) return alert("Enter a category name");

    const { error } = await supabase.from("categories").insert([{ name }]);

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    
    if (error) {
      console.error("Error deleting category:", error);
      return;
    }
    
    loadCategories();
  };

  if (!authorized) return <div className="p-6">Checking access...</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Manage Categories</h1>

      {/* Add Category */}
      <div className="bg-white p-4 shadow rounded space-y-3">
        <h2 className="font-semibold">Add New Category</h2>

        <input
          className="border p-2 rounded w-full"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={addCategory}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* List Categories */}
      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 shadow rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-gray-600 text-sm">
                {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${c.name}"?`)) {
                  deleteCategory(c.id);
                }
              }}
              className="text-red-600 hover:text-red-800 hover:underline transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No categories found. Add your first category above.
          </div>
        )}
      </div>
    </main>
  );
}