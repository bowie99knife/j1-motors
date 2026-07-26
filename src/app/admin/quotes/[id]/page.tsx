import QuoteBuilder from '@/components/QuoteBuilder';
export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <QuoteBuilder quoteId={id} />; }
