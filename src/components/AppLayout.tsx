"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Brain,
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
  Globe,
  Eye,
  Volume2,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("skillsync_lang") as "en" | "hi";
      if (savedLang) setLanguage(savedLang);
      const savedContrast = localStorage.getItem("skillsync_contrast") === "true";
      setHighContrast(savedContrast);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_lang", nextLang);
      window.dispatchEvent(new CustomEvent("skillsync_language_change", { detail: nextLang }));
    }
  };

  const toggleContrast = () => {
    const nextContrast = !highContrast;
    setHighContrast(nextContrast);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_contrast", String(nextContrast));
      if (nextContrast) {
        document.documentElement.classList.add("high-contrast-mode");
      } else {
        document.documentElement.classList.remove("high-contrast-mode");
      }
    }
  };

  const navigation = [
    { name: language === "hi" ? "अवलोकन" : "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: language === "hi" ? "स्किल ग्राफ" : "Skill Graph", href: "/graph", icon: Brain },
    { name: language === "hi" ? "अध्ययन योजना" : "Learn Plan", href: "/plan", icon: BookOpen },
    { name: language === "hi" ? "स्मार्ट प्रैक्टिस" : "Smart Practice", href: "/practice", icon: HelpCircle },
    { name: language === "hi" ? "एआई कोच" : "AI Coach", href: "/tutor", icon: MessageSquare },
    { name: language === "hi" ? "प्रगति ट्रैकर" : "Progress", href: "/progress", icon: TrendingUp },
    { name: language === "hi" ? "प्रोफ़ाइल" : "Learner Profile", href: "/profile", icon: User },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex ${highContrast ? "contrast-125" : ""}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                SkillSync <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-100">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Adaptive Loop Indicator */}
        <div className="px-4 py-3 m-3 rounded-xl bg-gradient-to-b from-indigo-50/70 to-purple-50/70 border border-indigo-100/90 shadow-xs hover:border-indigo-200 transition-all duration-300">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === "hi" ? "एडेप्टिव लूप सक्रिय" : "Adaptive Loop Active"}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            {language === "hi"
              ? "आपकी कमजोरियों और गलतियों के अनुसार अनुकूलित।"
              : "Calibrated to your diagnostic & prerequisite gaps."}
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

        {/* Accessibility & Language Controls */}
        <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === "en" ? "EN / हिन्दी" : "हिन्दी / EN"}</span>
          </button>

          <button
            onClick={toggleContrast}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              highContrast ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-100 text-slate-600"
            }`}
            title="Toggle Accessibility Contrast"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px]">A11y</span>
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-xs">
                {session?.user?.name ? session.user.name.charAt(0) : "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {session?.user?.name || "Alex Rivera"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {session?.user?.email || "alex@skillsync.ai"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-base text-slate-900">SkillSync AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 text-xs font-bold bg-slate-100 rounded-lg text-slate-700"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-xs z-30">
          <div className="bg-white border-b border-slate-200 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
