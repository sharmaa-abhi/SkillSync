"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  MessageSquare,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Zap,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Learn Plan", href: "/plan", icon: BookOpen },
    { name: "Practice", href: "/practice", icon: HelpCircle },
    { name: "AI Tutor", href: "/tutor", icon: MessageSquare },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Learning Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              SkillSync <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-100">AI</span>
            </span>
          </div>
        </div>

        {/* Adaptive Loop Indicator */}
        <div className="px-4 py-3 m-3 rounded-xl bg-gradient-to-b from-indigo-50/70 to-purple-50/70 border border-indigo-100/90 shadow-xs hover:border-indigo-200 transition-all duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Adaptive Loop Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Personalized to your assessment & recent quiz mistakes.
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 scale-[1.01]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-1"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-white scale-110" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-xs">
                {session?.user?.name ? session.user.name.charAt(0) : "S"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {session?.user?.name || "Student"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {session?.user?.email || "student@skillsync.ai"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-slate-900">SkillSync AI</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm pt-16 animate-fade-in">
          <div className="bg-white p-4 space-y-1 border-b border-slate-200 shadow-xl animate-fade-in-down">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 mt-2 flex justify-between items-center px-2">
              <span className="text-xs text-slate-500">{session?.user?.name || "Student"}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-rose-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
