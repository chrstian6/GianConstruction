"use client";

import { format } from "date-fns";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function SiteHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
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
    console.log("SiteHeader: handleLogout started");
    setIsLoggingOut(true);
    try {
      console.log("SiteHeader: Checking logout function");
      if (!logout || typeof logout !== "function") {
        console.error(
          "SiteHeader: logout is undefined or not a function",
          logout
        );
        throw new Error("Logout function not available");
      }
      console.log("SiteHeader: Calling AuthContext logout");
      await logout();
      console.log("SiteHeader: logout completed successfully");
      setShowLogoutModal(false);
    } catch (error) {
      console.error("SiteHeader: handleLogout error:", error);
    } finally {
      console.log("SiteHeader: handleLogout finished, resetting isLoggingOut");
      setIsLoggingOut(false);
    }
  };

  const onLogoutClick = () => {
    console.log("SiteHeader: Log Out button clicked");
    handleLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4">
        <div className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
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
            onClick={() => {
              console.log("SiteHeader: Sign Out button clicked");
              setShowLogoutModal(true);
            }}
            disabled={isLoggingOut}
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          {user && (
            <Button
              variant="outline"
              onClick={() => {
                console.log("SiteHeader: Direct Logout button clicked");
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              Direct Logout
            </Button>
          )}
        </div>
      </header>
      <Dialog
        open={showLogoutModal}
        onOpenChange={(open) => {
          console.log(`SiteHeader: Logout modal ${open ? "opened" : "closed"}`);
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
              onClick={() => {
                console.log("SiteHeader: Cancel button clicked");
                setShowLogoutModal(false);
              }}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onLogoutClick}
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
