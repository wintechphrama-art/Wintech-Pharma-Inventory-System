import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

import { logout } from "@/services/supabase/auth";

import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { profile } = useAuth();

  async function handleLogout() {
    await logout();

    window.location.href = "/";
  }

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-card/50">
              <Sidebar mobile={true} />
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
            Factory Inventory Management
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-medium">
              {profile?.full_name}
            </p>

            <p className="text-sm text-muted-foreground">
              {profile?.employee_code}
              {" "}
              {profile?.role}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}