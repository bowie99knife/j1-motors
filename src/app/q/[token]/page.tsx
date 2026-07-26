import CustomerQuote from '@/components/CustomerQuote';
export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <CustomerQuote token={token} />; }
