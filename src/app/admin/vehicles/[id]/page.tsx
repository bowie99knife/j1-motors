import VehicleProfile from '@/components/VehicleProfile';
export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <VehicleProfile id={id} />; }
