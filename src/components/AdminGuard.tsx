"use client";

import { useEffect, useState } from "react";
import { getCurrentUserAndRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { user, role } = await getCurrentUserAndRole();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (role !== "ADMIN") {
        router.replace("/user/dashboard");
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    run();
  }, [router]);

  if (checking) return <div className="p-8">Checking access…</div>;

  return <>{children}</>;
}
