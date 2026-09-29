"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import AICoach from "@/components/AICoach";
import { Loader2 } from "lucide-react";

function TutorContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || undefined;
  return <AICoach initialTopic={initialTopic} />;
}

export default function TutorPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        }
      >
        <TutorContent />
      </Suspense>
    </AppLayout>
  );
}
