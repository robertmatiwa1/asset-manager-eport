"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });
    setDepartments(data || []);
  };

  const addDepartment = async () => {
    if (!name.trim()) return alert("Enter department name");

    const { error } = await supabase.from("departments").insert([{ name }]);
    if (error) return alert(error.message);

    setName("");
    load();
  };

  const deleteDepartment = async (id: string) => {
    await supabase.from("departments").delete().eq("id", id);
    load();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-2xl font-semibold">Departments</h1>

        <div className="bg-white p-6 shadow rounded space-y-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={addDepartment}
          >
            Add Department
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
            {departments.map((d: any) => (
              <tr key={d.id}>
                <td className="px-3 py-2 border">{d.name}</td>
                <td className="px-3 py-2 border">
                  <button
                    className="text-red-500"
                    onClick={() => deleteDepartment(d.id)}
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
