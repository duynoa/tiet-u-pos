import HomePage from "@/src/features/home";

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default async function Home({ params }: PageProps) {
  const { branchId } = await params;
  return <HomePage branchId={branchId} />;
}
