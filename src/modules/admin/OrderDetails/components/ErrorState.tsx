import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorStateProps {
  error: string | null;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="container mx-auto p-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>
            {error || "The requested order could not be found."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/admin/orders">Return to Order List</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
