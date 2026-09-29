"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import {
  SubjectKey,
  SubjectConfig,
  ACTIVE_SUBJECT_STORAGE_KEY,
  ACTIVE_SUBJECT_EVENT,
  SUBJECT_CONFIGS,
  ALL_SUBJECTS,
  getActiveSubjectKey,
  setActiveSubjectKey,
  getSubjectConfig,
} from "@/lib/activeSubject";
import { useSubjectContext } from "@/context/SubjectContext";

export function useActiveSubject() {
  // If wrapped in SubjectProvider, leverage central context directly
  try {
    const context = useSubjectContext();
    return {
      activeSubject: context.activeSubject,
      activeSubjectConfig: context.activeSubjectConfig,
      setActiveSubject: context.setActiveSubject,
      allSubjects: context.allSubjects,
      isHydrated: context.isHydrated,
      context,
    };
  } catch {
    // Fallback for standalone/unwrapped components
    return useStandaloneActiveSubject();
  }
}

function useStandaloneActiveSubject() {
  const [activeSubject, setActiveSubjectState] = useState<SubjectKey>("Python");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initial = getActiveSubjectKey();
    setActiveSubjectState(initial);
    setIsHydrated(true);

    const handleSubjectChange = (e: Event) => {
      const customEvent = e as CustomEvent<SubjectKey>;
      if (customEvent.detail && SUBJECT_CONFIGS[customEvent.detail]) {
        setActiveSubjectState(customEvent.detail);
      } else {
        setActiveSubjectState(getActiveSubjectKey());
      }
    };

    window.addEventListener(ACTIVE_SUBJECT_EVENT, handleSubjectChange);
    window.addEventListener("storage", (e) => {
      if (e.key === ACTIVE_SUBJECT_STORAGE_KEY) {
        setActiveSubjectState(getActiveSubjectKey());
      }
    });

    return () => {
      window.removeEventListener(ACTIVE_SUBJECT_EVENT, handleSubjectChange);
    };
  }, []);

  const setActiveSubject = useCallback((key: SubjectKey) => {
    setActiveSubjectKey(key);
    setActiveSubjectState(key);
  }, []);

  const activeSubjectConfig: SubjectConfig = getSubjectConfig(activeSubject);

  return {
    activeSubject,
    activeSubjectConfig,
    setActiveSubject,
    allSubjects: ALL_SUBJECTS,
    isHydrated,
    context: null,
  };
}
