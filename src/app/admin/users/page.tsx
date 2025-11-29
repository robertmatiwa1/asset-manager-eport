"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AdminLoader from "@/components/AdminLoader";

export default function AdminUsersPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at");

    setUsers(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");

      setAuthorized(true);
      await loadUsers();
      setLoading(false);
    };

    init();
  }, []);

  if (!authorized || loading) return <AdminLoader />;

  const inviteUser = async () => {
    if (!email.trim() || !fullName.trim())
      return alert("Full name & email are required.");

    setSaving(true);

    const { error } = await supabase.from("profiles").insert([
      {
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        role: "USER",
      },
    ]);

    setSaving(false);

    if (error) return alert("Error creating user");

    setEmail("");
    setFullName("");
    loadUsers();
  };

  return (
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

        <input
          className="border p-2 rounded w-full"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={inviteUser}
          disabled={saving}
        >
          {saving ? "Saving..." : "Create User"}
        </button>
      </div>

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
          {users.map((u: any) => (
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
  );
}
