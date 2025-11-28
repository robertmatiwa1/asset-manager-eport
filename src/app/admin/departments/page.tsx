"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function DepartmentsPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
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
      fetchDepartments();
    };

    load();
  }, [router]);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setDepartments(data || []);
  };

  // ---------------------------------------------------
  // CREATE DEPARTMENT
  // ---------------------------------------------------
  const createDepartment = async () => {
    if (!newDepartment.trim()) return alert("Department name is required");

    setLoading(true);

    const { error } = await supabase
      .from("departments")
      .insert([{ name: newDepartment.trim() }]);

    setLoading(false);

    if (error) {
      console.error(error);
      return alert("Failed to create department");
    }

    setNewDepartment("");
    fetchDepartments();
  };

  // ---------------------------------------------------
  // DELETE DEPARTMENT
  // ---------------------------------------------------
  const deleteDepartment = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return alert("Failed to delete department");
    }

    fetchDepartments();
  };

  if (!authorised)
    return <div className="p-8">Checking access…</div>;

  // ---------------------------------------------------
  // PAGE RENDER
  // ---------------------------------------------------
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Departments</h1>

      {/* CREATE NEW DEPARTMENT */}
      <section className="border rounded p-4 bg-gray-50 space-y-3">
        <h2 className="font-medium">Add New Department</h2>

        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Department name"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
        />

        <button
          onClick={createDepartment}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Department"}
        </button>
      </section>

      {/* LIST DEPARTMENTS */}
      <section>
        <h2 className="font-medium mb-2">Existing Departments</h2>

        {departments.length === 0 ? (
          <p className="text-gray-500">No departments found.</p>
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
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="px-3 py-2 border">{d.name}</td>
                  <td className="px-3 py-2 border">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border">
                    <button
                      onClick={() => deleteDepartment(d.id)}
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
