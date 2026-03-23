import PaymentStatusPage from "@/components/pages/PaymentStatusPage";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;

  return <PaymentStatusPage orderId={orderId} />;
}