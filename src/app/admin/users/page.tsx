"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";
import Modal from "@/components/Modal";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // Delete modal
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDelete = (id: string) => {
    setSelectedId(id);
    setConfirmDelete(true);
  };

  const doDelete = async () => {
    if (!selectedId) return;

    await supabase.from("profiles").delete().eq("id", selectedId);

    setConfirmDelete(false);
    setSelectedId(null);
    loadUsers();
  };

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setUsers((data as Profile[]) || []);
    setLoading(false);
  };

  const inviteUser = async () => {
    if (!email.trim() || !fullName.trim())
      return alert("All fields are required");

    const newId = crypto.randomUUID();

    const { error } = await supabase.from("profiles").insert([
      {
        id: newId,
        email,
        full_name: fullName,
        role: "USER",
      },
    ]);

    if (error) return alert(error.message);

    setEmail("");
    setFullName("");
    loadUsers();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-3xl font-semibold">Manage Users</h1>

        {/* Add user form */}
        <div className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="font-medium text-xl">Create New User</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={inviteUser}
          >
            Create User
          </button>
        </div>

        {/* User list */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">All Users</h2>

          {loading ? (
            <>
              <div className="bg-white p-4 shadow rounded h-16 animate-pulse" />
              <div className="bg-white p-4 shadow rounded h-16 animate-pulse" />
            </>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">Role</th>
                  <th className="border px-3 py-2">Joined</th>
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-3 py-2">{u.full_name}</td>
                    <td className="border px-3 py-2">{u.email}</td>
                    <td className="border px-3 py-2">{u.role}</td>
                    <td className="border px-3 py-2">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => openDelete(u.id)}
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
        </div>

        {/* Delete confirmation modal */}
        <Modal open={confirmDelete} title="Confirm Delete">
          <p>Are you sure you want to delete this user?</p>

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
    </AdminGuard>
  );
}
