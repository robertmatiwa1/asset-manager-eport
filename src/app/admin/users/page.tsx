"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setUsers((data as Profile[]) || []);
  };

  const createProfile = async () => {
    if (!email.trim() || !fullName.trim()) {
      alert("Please enter both full name and email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("profiles").insert([
      {
        id: crypto.randomUUID(), // unique identifier for profile
        email,
        full_name: fullName,
        role: "USER",
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error creating profile: " + error.message);
      return;
    }

    setEmail("");
    setFullName("");
    loadUsers();
  };

  return (
    <AdminGuard>
      <main className="p-8 space-y-8">
        <h1 className="text-2xl font-semibold">Manage Users</h1>

        <div className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="font-medium">Create New User Profile</h2>

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
            onClick={createProfile}
            disabled={loading}
          >
            {loading ? "Saving..." : "Create User"}
          </button>
        </div>

        <h2 className="font-semibold text-xl">All Users</h2>

        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Name</th>
              <th className="border px-3 py-2">Email</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-3 py-2">{u.full_name}</td>
                <td className="border px-3 py-2">{u.email}</td>
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
