import { AnalysisDetailClient } from "./AnalysisDetailClient";
import { getIncidents } from "@/lib/incidents";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // getIncidents() reads the filesystem (research/incidents/*.json) — it
  // must run server-side and be passed down as data, never imported
  // directly from a "use client" file (that would pull `node:fs` into the
  // browser bundle and fail at build time).
  const incidents = getIncidents();
  return <AnalysisDetailClient id={id} incidents={incidents} />;
}
