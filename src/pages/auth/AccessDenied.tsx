import { Link } from "react-router-dom";

import { ShieldX, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Access Denied
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">
          You don't have permission to view this page.
          Contact your administrator if you believe this is an error.
        </p>

        <div className="mt-8">
          <Button asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
