"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoader from "@/components/AdminLoader";

type Department = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminDepartmentsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");

  const loadDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setDepartments((data as Department[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      await loadDepartments();
      setLoading(false);
    };

    init();
  }, []);

  if (!authorized || loading) return <AdminLoader />;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-semibold">Manage Departments</h1>

      <div className="bg-white p-4 shadow rounded space-y-3">
        <h2 className="font-semibold">Add New Department</h2>

        <input
          className="border p-2 rounded w-full"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={async () => {
            if (!name) return alert("Enter department name");
            await supabase.from("departments").insert([{ name }]);
            setName("");
            loadDepartments();
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Department
        </button>
      </div>

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
              onClick={() => {
                supabase.from("departments").delete().eq("id", d.id);
                loadDepartments();
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
