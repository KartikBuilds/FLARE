import { AnalysisDetailClient } from "./AnalysisDetailClient";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalysisDetailClient id={id} />;
}
