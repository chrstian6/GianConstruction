"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { motion } from "framer-motion";

// Animation variants for navbar links and buttons
const linkVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
};

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { setIsLoginOpen, setIsCreateAccountOpen } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (!logout || typeof logout !== "function") {
        throw new Error("Logout function not available");
      }
      await logout();
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

  return (
    <>
      <motion.nav
        className="bg-white shadow-md fixed w-full top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Global transparent scrollbar styles */}

        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Gian Construction
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`relative text-gray-600 transition-all duration-300 group ${
                    pathname === link.href ||
                    (link.href.includes("#") &&
                      pathname + link.href ===
                        window.location.pathname + window.location.hash)
                      ? "text-primary font-semibold"
                      : "hover:text-primary"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ${
                      pathname === link.href ||
                      (link.href.includes("#") &&
                        pathname + link.href ===
                          window.location.pathname + window.location.hash)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </Link>
              </motion.div>
            ))}
            {user && (
              <motion.div
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>
              </motion.div>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:text-primary transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span>Hi, {user.firstName}</span>
                    </Button>
                  </motion.div>
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
              <motion.div
                className="flex space-x-4"
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setIsLoginOpen(true)}
                  className="hover:bg-primary hover:text-white transition-colors"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setIsCreateAccountOpen(true)}
                  className="bg-primary hover:scale-105 transition-transform"
                >
                  Sign Up
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden text-gray-600 hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: (navLinks.length + 2) * 0.1 }}
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
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="md:hidden bg-white border-t"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`relative text-gray-600 transition-all duration-300 ${
                      pathname === link.href ||
                      (link.href.includes("#") &&
                        pathname + link.href ===
                          window.location.pathname + window.location.hash)
                        ? "text-primary font-semibold"
                        : "hover:text-primary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ${
                        pathname === link.href ||
                        (link.href.includes("#") &&
                          pathname + link.href ===
                            window.location.pathname + window.location.hash)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    ></span>
                  </Link>
                </motion.div>
              ))}
              {user && (
                <>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Link
                      href="/cart"
                      className="text-gray-600 hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Cart
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  >
                    <Link
                      href="/profile"
                      className="text-gray-600 hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: (navLinks.length + 2) * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsLogoutModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="hover:text-primary"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </>
              )}
              {!user && (
                <>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsOpen(false);
                      }}
                      className="hover:bg-primary hover:text-white"
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  >
                    <Button
                      onClick={() => {
                        setIsCreateAccountOpen(true);
                        setIsOpen(false);
                      }}
                      className="bg-primary hover:scale-105 transition-transform"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

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
