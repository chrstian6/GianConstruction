"use client";

import { format } from "date-fns";
import { LogOut, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SiteHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), "h:mm:ss a"));
    }, 1000);

    setCurrentTime(format(new Date(), "h:mm:ss a"));

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!logout || typeof logout !== "function") {
        throw new Error("Logout function not available");
      }
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard
    breadcrumbs.push({
      name: "Dashboard",
      href: "/admin",
      isCurrent: pathname === "/admin",
      isClickable: true,
    });

    // Add other paths
    let currentPath = "/admin";
    for (let i = 0; i < paths.length; i++) {
      if (paths[i] === "admin") continue; // Skip the admin part

      currentPath += `/${paths[i]}`;
      const name = paths[i]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Special case for "inventory" - make it non-clickable
      const isClickable = paths[i] !== "inventory" && i !== paths.length - 1;

      breadcrumbs.push({
        name,
        href: currentPath,
        isCurrent: i === paths.length - 1,
        isClickable,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                )}
                {crumb.isCurrent ? (
                  <span className="font-medium text-foreground">
                    {crumb.name}
                  </span>
                ) : crumb.isClickable ? (
                  <Link
                    href={crumb.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{crumb.name}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium">
          {currentTime}
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
          <Button
            variant="ghost"
            aria-label="Sign Out"
            className="flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-gray-100"
            onClick={() => setShowLogoutModal(true)}
            disabled={isLoggingOut}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      <Dialog
        open={showLogoutModal}
        onOpenChange={(open) => {
          if (!isLoggingOut) {
            setShowLogoutModal(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging Out..." : "Log Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
