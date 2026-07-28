"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth(); const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace("/auth/login"); }, [ready, user, router]);
  if (!ready || !user) 
    return <div className="grid min-h-screen place-items-center bg-slate-50">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-100 border-t-blue-600"/>
            </div>;
  return <AppShell>{children}</AppShell>;
}
