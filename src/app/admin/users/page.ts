"use client";

import { useEffect, useState } from "react";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const router = useRouter();
  const [authorised, setAuthorised] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { user, role } = await getCurrentUserAndRole();
      if (!user) return router.replace("/login");
      if (role !== "ADMIN") return router.replace("/user/dashboard");
      setAuthorised(true);

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false });
      setUsers(data || []);
    };
    load();
  }, [router]);

  const inviteUser = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/invite-user", {
      method: "POST",
      body: JSON.stringify({ email, fullName }),
    });
    setLoading(false);

    if (!res.ok) return alert("Failed to invite user");

    alert("User invited successfully");
    setEmail("");
    setFullName("");
  };

  if (!authorised) {
    return (
      <div className="p-8">
        Checking access…
      </div>
    );
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Users</h1>

      <section className="space-y-3 border rounded p-4 bg-gray-50">
        <h2 className="font-medium">Invite New User</h2>

        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={inviteUser}
          disabled={loading}
        >
          {loading ? "Inviting…" : "Invite User"}
        </button>
      </section>

      <section>
        <h2 className="font-medium mb-2">Existing Users</h2>
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Role</th>
              <th className="px-3 py-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 border">{u.full_name}</td>
                <td className="px-3 py-2 border">{u.role}</td>
                <td className="px-3 py-2 border">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
