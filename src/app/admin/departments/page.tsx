"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Department = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminDepartmentsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");

  // ---------------------------------
  // Load Departments BEFORE useEffect
  // ---------------------------------
  const loadDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    // FIX FOR VERCEL
    setDepartments((data as unknown as Department[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      loadDepartments(); // SAFE NOW
    };

    init();
  }, []);

  const addDepartment = async () => {
    if (!name.trim()) return alert("Enter a department name");

    const { error } = await supabase.from("departments").insert([{ name }]);

    if (error) return alert(error.message);

    setName("");
    loadDepartments();
  };

  const deleteDepartment = async (id: string) => {
    await supabase.from("departments").delete().eq("id", id);
    loadDepartments();
  };

  if (!authorized) return <div className="p-6">Checking access...</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Manage Departments</h1>

      {/* Add Department */}
      <div className="bg-white p-4 shadow rounded space-y-3">
        <h2 className="font-semibold">Add New Department</h2>

        <input
          className="border p-2 rounded w-full"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={addDepartment}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Department
        </button>
      </div>

      {/* List Departments */}
      <div className="space-y-3">
        {departments.map((d) => (
          <div
            key={d.id}
            className="bg-white p-4 shadow rounded flex justify-between"
          >
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-gray-600 text-sm">{d.created_at}</div>
            </div>

            <button
              onClick={() => deleteDepartment(d.id)}
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
