"use client";

import { useState, useCallback } from "react";
import { TestType } from "@/lib/types";

export const useTestRunner = () => {
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({});

  const runTest = useCallback(async (type: TestType) => {
    // Only run if not already testing
    if (isTesting) return;

    setActiveTest(type);
    setIsTesting(true);
    
    try {
      // Simulate multiple phases of testing for better UI feel
      // In a real app, these would be separate socket emissions or pings
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`/api/diagnostics/${type}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          alert("Rate limit exceeded. Please wait a moment.");
        }
        throw new Error("Failed to fetch diagnostics");
      }

      const data = await response.json();
      
      // Artificial delay to make it feel like it's analyzing
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResults(prev => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting]);

  return { activeTest, isTesting, results, runTest };
};
