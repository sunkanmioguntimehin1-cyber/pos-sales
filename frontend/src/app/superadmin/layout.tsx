// frontend/src/app/superadmin/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { SuperadminSidebar } from "@/components/superadmin/SuperadminSidebar";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      router.push("/login");
      return;
    }
    if (user.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [token, user, router]);

  if (!user || user.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080C14]">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080C14]">
      <SuperadminSidebar />
      <main className="ml-64 flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
