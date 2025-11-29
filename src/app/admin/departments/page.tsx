"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

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

  const [loading, setLoading] = useState(true);

  // Modal state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDelete = (id: string) => {
    setSelectedId(id);
    setConfirmDelete(true);
  };

  const doDelete = async () => {
    if (!selectedId) return;

    await supabase.from("departments").delete().eq("id", selectedId);

    setConfirmDelete(false);
    setSelectedId(null);

    loadDepartments();
  };

  // Auth + load departments
  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      loadDepartments();
    };

    init();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setDepartments((data as Department[]) || []);
    setLoading(false);
  };

  const addDepartment = async () => {
    if (!name.trim()) return alert("Enter a department name");

    const { error } = await supabase.from("departments").insert([{ name }]);

    if (error) return alert(error.message);

    setName("");
    loadDepartments();
  };

  if (!authorized) return <div className="p-8">Checking access...</div>;

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-semibold">Departments</h1>

      {/* Add department */}
      <div className="bg-white p-6 shadow rounded space-y-4">
        <h2 className="text-xl font-semibold">Add Department</h2>

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

      {/* Department list */}
      <div className="space-y-3">
        {loading ? (
          <>
            <div className="bg-white p-4 shadow rounded h-16 animate-pulse"></div>
            <div className="bg-white p-4 shadow rounded h-16 animate-pulse"></div>
          </>
        ) : departments.length === 0 ? (
          <p>No departments yet.</p>
        ) : (
          departments.map((d) => (
            <div
              key={d.id}
              className="bg-white p-4 shadow rounded flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-gray-600 text-sm">
                  {new Date(d.created_at).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => openDelete(d.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal open={confirmDelete} title="Confirm Delete">
        <p>Are you sure you want to delete this department?</p>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={doDelete}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </main>
  );
}
