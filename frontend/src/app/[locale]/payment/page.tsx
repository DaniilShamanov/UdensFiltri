import PaymentPage from "@/components/pages/PaymentPage";

export default async function Page({ params }: { params: { locale: string } }) {
  return <PaymentPage />;
}
