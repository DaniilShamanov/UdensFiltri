import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>RETURNS</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          <p>
            This page is a placeholder. Replace it with your real content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
