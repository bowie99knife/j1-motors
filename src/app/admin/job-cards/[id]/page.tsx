import JobCardEditor from '@/components/JobCardEditor';
export default async function JobCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobCardEditor jobId={id} />;
}
