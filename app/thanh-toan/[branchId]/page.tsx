import Checkout from "@/src/features/checkout"

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { branchId } = await params;
  return <Checkout branchId={branchId} />;
}
