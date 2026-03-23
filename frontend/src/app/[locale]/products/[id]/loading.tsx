import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Spinner />
    </div>
  );
}