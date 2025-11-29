"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoader from "@/components/AdminLoader";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setCategories((data as Category[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      await loadCategories();
      setLoading(false);
    };

    init();
  }, []);

  if (!authorized || loading) return <AdminLoader />;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Manage Categories</h1>

      <div className="bg-white p-4 shadow rounded space-y-3">
        <h2 className="font-semibold">Add New Category</h2>

        <input
          className="border p-2 rounded w-full"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={async () => {
            if (!name) return alert("Enter category name");
            await supabase.from("categories").insert([{ name }]);
            setName("");
            loadCategories();
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Category
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 shadow rounded flex justify-between"
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-gray-600 text-sm">{c.created_at}</div>
            </div>

            <button
              onClick={() => {
                supabase.from("categories").delete().eq("id", c.id);
                loadCategories();
              }}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
