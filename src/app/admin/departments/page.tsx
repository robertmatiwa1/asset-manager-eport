"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";

type Department = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
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
      await loadDepartments();
    };

    init();
  }, [router]);

  // ----------------------------
  // Load departments from Supabase
  // ----------------------------
  const loadDepartments = async () => {
    const { data } = await supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });

    setDepartments((data as Department[]) || []);
  };

  // ----------------------------
  // Add a new department
  // ----------------------------
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDepartment.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("departments")
      .insert({ name: newDepartment.trim() });

    setLoading(false);

    if (error) {
      alert("Error creating department: " + error.message);
      return;
    }

    setNewDepartment("");
    await loadDepartments();
  };

  // ----------------------------
  // Delete department
  // ----------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Cannot delete department. It may be used by an asset.");
      return;
    }

    await loadDepartments();
  };

  if (!authorised) return <div className="p-8">Checking access…</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Departments</h1>

      {/* Add Department Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="New department name"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Department"}
        </button>
      </form>

      {/* Department List */}
      <table className="min-w-full border rounded mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Department</th>
            <th className="border px-3 py-2 text-left">Created</th>
            <th className="border px-3 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dep) => (
            <tr key={dep.id}>
              <td className="border px-3 py-2">{dep.name}</td>
              <td className="border px-3 py-2">
                {new Date(dep.created_at).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2 text-center">
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(dep.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {departments.length === 0 && (
            <tr>
              <td className="border px-3 py-2 text-center" colSpan={3}>
                No departments yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
