"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at"); // <-- REMOVED email !!!

    if (error) console.error(error);
    setUsers(data || []);
  };

  const inviteUser = async () => {
    setLoading(true);

    const { error } = await supabase.from("profiles").insert([
      {
        id: crypto.randomUUID(),
        full_name: fullName,
        role: "USER",
      },
    ]);

    setLoading(false);

    if (error) return alert("Error creating user");

    setFullName("");
    setEmail("");
    loadUsers();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-2xl font-semibold">Manage Users</h1>

        <div className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="font-medium">Add User</h2>

          <input
            className="border p-2 rounded w-full"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={inviteUser}
            disabled={loading}
          >
            {loading ? "Saving..." : "Create User"}
          </button>
        </div>

        <h2 className="text-xl font-semibold">All Users</h2>

        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="border px-3 py-2">{u.full_name}</td>
                <td className="border px-3 py-2">{u.role}</td>
                <td className="border px-3 py-2">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </AdminGuard>
  );
}
