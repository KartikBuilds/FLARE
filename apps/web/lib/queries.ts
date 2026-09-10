"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyses, fetchAnalysis } from "./api-client";

export function useAnalyses() {
  return useQuery({ queryKey: ["analyses"], queryFn: fetchAnalyses });
}

export function useAnalysis(id: string) {
  return useQuery({ queryKey: ["analyses", id], queryFn: () => fetchAnalysis(id), enabled: Boolean(id) });
}
