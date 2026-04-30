"use client";

import { useState, useEffect } from "react";
import { TestHistoryEntry, TestType, AnyResult } from "@/lib/types";

const HISTORY_KEY = "speedshow_history";
const MAX_HISTORY_ITEMS = 20;

export const useTestHistory = () => {
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load test history", e);
    }
  }, []);

  const addHistoryEntry = (type: TestType, score: number, metrics: AnyResult) => {
    const entry: TestHistoryEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type,
      score,
      metrics
    };

    setHistory(prev => {
      const newHistory = [entry, ...prev].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save test history", e);
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear test history", e);
    }
  };

  return { history, addHistoryEntry, clearHistory };
};
