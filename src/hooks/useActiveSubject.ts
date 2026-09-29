"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useActiveSubject() {
  const [activeSubject, setActiveSubjectState] = useState<SubjectKey>("Maths");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Initial read on client mount
    const initial = getActiveSubjectKey();
    setActiveSubjectState(initial);
    setIsHydrated(true);

    // Event listener for cross-component or cross-page updates
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
  };
}
