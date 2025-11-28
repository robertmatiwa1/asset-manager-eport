"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function NewAssetPage() {
  const router = useRouter();

  const [authorised, setAuthorised] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [datePurchased, setDatePurchased] = useState("");
  const [cost, setCost] = useState("");

  // ----------------------------------------
  // Ensure USER role and load dropdown data
  // ----------------------------------------
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "USER") return router.replace("/admin/dashboard");

      setAuthorised(true);
      setUserId(user.id);

      // Load categories + departments
      const [{ data: cats }, { data: deps }] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("departments").select("id, name").order("name"),
      ]);

      setCategories(cats || []);
      setDepartments(deps || []);
    };

    init();
  }, [router]);

  // ----------------------------------------
  // Handle form submit
  // ----------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const { error } = await supabase.from("assets").insert({
      name,
      category_id: categoryId,
      department_id: departmentId,
      date_purchased: datePurchased,
      cost: Number(cost),
      created_by: userId,
    });

    if (error) {
      alert("Error creating asset: " + error.message);
      return;
    }

    router.push("/user/assets");
  };

  if (!authorised) return <div className="p-8">Loading…</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Add New Asset</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Asset Name */}
        <div>
          <label className="block mb-1 text-sm">Asset Name</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-sm">Category</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block mb-1 text-sm">Department</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          >
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date purchased */}
        <div>
          <label className="block mb-1 text-sm">Date Purchased</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={datePurchased}
            onChange={(e) => setDatePurchased(e.target.value)}
            required
          />
        </div>

        {/* Cost */}
        <div>
          <label className="block mb-1 text-sm">Cost</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </div>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          type="submit"
        >
          Save Asset
        </button>
      </form>
    </main>
  );
}
