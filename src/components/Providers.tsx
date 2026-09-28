"use client";
import { SessionProvider } from "next-auth/react";
import ScrollRevealObserver from "@/components/ScrollRevealObserver";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ScrollRevealObserver />
      {children}
    </SessionProvider>
  );
}

