"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserAndRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------
  // Handle Login Submission
  // --------------------------
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Sign in through Supabase Auth
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    // Fetch user and profile/role
    const { user, role } = await getCurrentUserAndRole();

    setLoading(false);

    if (!user || !role) {
      setError("Your profile is not set up correctly.");
      return;
    }

    // Redirect by role
    if (role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (role === "USER") {
      router.replace("/user/dashboard");
    } else {
      setError("Unknown user role.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          Asset Manager Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
