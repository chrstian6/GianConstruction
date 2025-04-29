// components/site-header.tsx
"use client";
import { format } from "date-fns";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function SiteHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Logout Failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
      <div className="text-sm text-muted-foreground">
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:block">
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({user.role})
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-gray-100"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
