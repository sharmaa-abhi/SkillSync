"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Loader2, Sparkles } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    async function autoLogin() {
      try {
        const res = await signIn("credentials", {
          email: "alex@skillsync.ai",
          password: "password123",
          redirect: false,
        });

        if (res?.ok && !res?.error) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login?demo=true");
        }
      } catch {
        router.push("/login?demo=true");
      }
    }

    autoLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-6 animate-pulse">
        <Zap className="w-7 h-7 fill-current" />
      </div>
      <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-2">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span>Instant Demo Mode</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-4">
        Preparing Alex Rivera&apos;s Learning Space...
      </h1>
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        <span>Logging you in directly to dashboard...</span>
      </div>
    </div>
  );
}
