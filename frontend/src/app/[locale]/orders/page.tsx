import OrdersPage from "@/components/pages/OrdersPage";

export default async function Page({ params }: { params: { locale: string } }) {
  return <OrdersPage />;
}
