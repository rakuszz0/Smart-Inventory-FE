import { ResourceForm } from "@/components/features/resource-form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResourceForm resource="payments" mode="edit" recordId={id} />;
}
