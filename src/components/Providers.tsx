"use client";
import { SessionProvider } from "next-auth/react";
import ScrollRevealObserver from "@/components/ScrollRevealObserver";
import { SubjectProvider } from "@/context/SubjectContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SubjectProvider>
        <ScrollRevealObserver />
        {children}
      </SubjectProvider>
    </SessionProvider>
  );
}
