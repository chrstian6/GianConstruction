"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { setIsLoginOpen, setIsCreateAccountOpen } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log(
    "Navbar: Rendering, user:",
    user ? user.email : "none",
    "loading:",
    loading
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!logout || typeof logout !== "function") {
        throw new Error("Logout function not available");
      }
      await logout();
      console.log(
        "Navbar: Logout successful, navigation handled by AuthContext"
      );
      toast.success("Logged out successfully");
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error("Navbar: Logout error:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = loading
    ? []
    : user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/supplies", label: "Supplies" },
        { href: "/designs", label: "Designs" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/#about", label: "About" },
        { href: "/#services", label: "Services" },
        { href: "/supplies", label: "Supplies" },
        { href: "/designs", label: "Designs" },
      ];

  if (loading) {
    console.log("Navbar: Loading state, rendering skeleton");
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Gian Construction
          </Link>
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </nav>
    );
  }

  console.log(
    "Navbar: Rendering full navbar, user:",
    user ? "authenticated" : "unauthenticated"
  );

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Gian Construction
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/cart" className="text-gray-600 hover:text-primary">
                <ShoppingCart className="h-6 w-6" />
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span>Hi, {user.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsLogoutModalOpen(true)}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                  Login
                </Button>
                <Button onClick={() => setIsCreateAccountOpen(true)}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-600 hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Cart
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsLogoutModalOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreateAccountOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      <Dialog
        open={isLogoutModalOpen}
        onOpenChange={(open) => {
          if (!isLoggingOut) {
            setIsLogoutModalOpen(open);
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
              onClick={() => setIsLogoutModalOpen(false)}
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
