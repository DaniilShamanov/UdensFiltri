import AccountPage from "@/components/pages/AccountPage";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountPage />;
}
