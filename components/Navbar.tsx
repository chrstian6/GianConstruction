"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/login-form";
import CreateAccountForm from "@/components/create-account-form";
import { useModal } from "@/contexts/ModalContext";

export default function Navbar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const {
    isLoginOpen,
    setIsLoginOpen,
    isCreateAccountOpen,
    setIsCreateAccountOpen,
    showLogin,
    setShowLogin,
  } = useModal();

  const getInitials = () => {
    if (!user) return "GC";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      login({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        contact: data.user.contact || "",
        gender: data.user.gender || "",
        address: data.user.address || "",
        isActive: data.user.isActive !== false,
        tempRegistration: data.user.tempRegistration || false,
      });
      toast.success("Login Successful!");
      setIsLoginOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Login Failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      toast.success("Logged out successfully");
      setMobileMenuOpen(false);
      router.push("/");
      router.refresh(); // Add this to refresh the page and update auth state
    } catch (error) {
      toast.error("Logout Failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleSwitchToSignUp = () => {
    setIsLoginOpen(false);
    setIsCreateAccountOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsCreateAccountOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/gianconstruction2.png"
              alt="Gian Construction"
              width={160}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="font-medium text-gray-900 hover:text-primary transition-colors"
          >
            Home
          </Link>
          {!user ? (
            <>
              <Link
                href="/#about"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/#services"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Services
              </Link>
              <Link
                href="/supplies"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Supplies
              </Link>
              <Link
                href="/designs"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Designs
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="font-medium text-gray-900 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/supplies"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Supplies
              </Link>
              <Link
                href="/designs"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Designs
              </Link>
              <Link
                href="/projects"
                className="font-medium text-gray-600 hover:text-primary transition-colors"
              >
                Projects
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="hidden md:block" variant="outline">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                  </DialogHeader>
                  <LoginForm
                    switchToSignUp={handleSwitchToSignUp}
                    onLogin={handleLogin}
                    onClose={() => setIsLoginOpen(false)}
                    isLoading={isLoading} // This was missing
                  />
                </DialogContent>
              </Dialog>

              {/* Separate Sign Up Dialog */}
              <Dialog
                open={isCreateAccountOpen}
                onOpenChange={setIsCreateAccountOpen}
              >
                <DialogTrigger asChild>
                  <Button className="hidden md:block" variant="default">
                    Sign Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                  </DialogHeader>
                  <CreateAccountForm
                    switchToLogin={handleSwitchToLogin}
                    onRegistrationSuccess={(email, password) => {
                      handleLogin(email, password);
                      setIsCreateAccountOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-700">Hi, {user.firstName}</span>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          {!user ? (
            <>
              <Link
                href="/#about"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/#services"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/supplies"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Supplies
              </Link>
              <Link
                href="/designs"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Designs
              </Link>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="mt-2 w-full"
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">Welcome, {user.firstName}!</span>
              </div>
              <Link
                href="/dashboard"
                className="block font-medium text-gray-900 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/supplies"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Supplies
              </Link>
              <Link
                href="/designs"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Designs
              </Link>
              <Link
                href="/dashboard/profile"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/dashboard/history"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Order History
              </Link>
              <Link
                href="/dashboard/projects"
                className="block font-medium text-gray-600 py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="mt-2"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
