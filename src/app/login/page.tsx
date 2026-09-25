"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const performDemoLogin = async () => {
    setError("");
    setDemoLoading(true);
    try {
      const res = await signIn("credentials", {
        email: "alex@skillsync.ai",
        password: "password123",
        redirect: false,
      });

      if (res?.error) {
        setError("Demo login failed. Please try again or create a new account.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Unable to launch demo mode. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true" || params.get("demo") === "1") {
        performDemoLogin();
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in-down">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-transform duration-200 group-hover:scale-105">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">SkillSync AI</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Welcome back to your learning loop
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{" "}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            create a new student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 animate-scale-in delay-100">
        <div className="bg-white py-8 px-6 shadow-sm hover:shadow-md border border-slate-200/80 rounded-2xl sm:px-10 transition-shadow duration-300">
          {/* Quick Demo Login Option */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <button
              type="button"
              onClick={performDemoLogin}
              disabled={demoLoading || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 font-semibold text-sm transition-all duration-200 shadow-sm interactive-btn active:scale-98 cursor-pointer disabled:opacity-75"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Logging in as Alex Rivera...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Instant Demo Mode (Alex Rivera)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-1.5">
              1-click instant login with pre-configured DBMS assessment profile
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm transition-all duration-200 focus:shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm transition-all duration-200 focus:shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-semibold text-sm shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
