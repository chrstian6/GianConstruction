"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  email: string;
  lastName: string;
  firstName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Pause verifyUser during logout
  const [postLogout, setPostLogout] = useState(false); // Skip cache post-logout
  const [loginCompleted, setLoginCompleted] = useState(false); // Lock user state post-login
  const router = useRouter();
  const pathname = usePathname();
  const userCache = useRef<User | null>(null); // Cache to reduce /api/auth/verify calls
  const isVerifying = useRef(false); // Prevent concurrent verifyUser calls
  const logoutPromise = useRef<Promise<void> | null>(null); // Track logout promise
  const lastVerifyTime = useRef<number>(0); // Debounce verifyUser calls

  const verifyUser = useCallback(async () => {
    // Skip if logging out or logout is in progress
    if (isLoggingOut || logoutPromise.current) {
      console.log(
        `AuthContext: Skipping verifyUser (isLoggingOut: ${isLoggingOut}, logoutPromise: ${!!logoutPromise.current})`
      );
      if (logoutPromise.current) {
        await logoutPromise.current; // Wait for logout to complete
      }
      return;
    }

    // Skip if already verifying
    if (isVerifying.current) {
      console.log("AuthContext: Skipping verifyUser (isVerifying: true)");
      return;
    }

    // Debounce: Skip if called within 2000ms
    const now = Date.now();
    if (now - lastVerifyTime.current < 2000) {
      console.log("AuthContext: Skipping verifyUser (debounced)");
      return;
    }
    lastVerifyTime.current = now;

    console.log("AuthContext: Verifying user, pathname:", pathname);
    isVerifying.current = true;

    try {
      // Use cached user if available and not post-logout
      if (userCache.current && !postLogout) {
        console.log("AuthContext: Using cached user:", userCache.current);
        if (!user || !loginCompleted) {
          setUser(userCache.current);
          setIsAdmin(userCache.current?.role === "admin");
        }
        // Protect routes
        if (
          pathname.startsWith("/admin") &&
          userCache.current?.role !== "admin"
        ) {
          console.log(
            "AuthContext: Non-admin on /admin route, redirecting to /"
          );
          toast.error("Access Denied: Admin routes are restricted.");
          router.replace("/"); // Replace to clear history
        } else if (
          userCache.current?.role === "admin" &&
          (pathname.startsWith("/dashboard") ||
            pathname.startsWith("/profile") ||
            pathname.startsWith("/cart"))
        ) {
          console.log(
            "AuthContext: Admin on user route, redirecting to /admin"
          );
          toast.error("Access Denied: Admins cannot access user routes.");
          router.replace("/admin"); // Replace to clear history
        } else if (pathname === "/" && userCache.current?.role === "user") {
          console.log("AuthContext: User on /, redirecting to /dashboard");
          router.replace("/dashboard"); // Replace to clear history
        } else if (pathname === "/" && userCache.current?.role === "admin") {
          console.log("AuthContext: Admin on /, redirecting to /admin");
          router.replace("/admin"); // Replace to clear history
        }
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Verification successful, user:", data.user);
        setUser(data.user);
        userCache.current = data.user; // Cache user
        setPostLogout(false); // Reset post-logout flag
        setIsAdmin(data.user?.role === "admin");
        // Protect routes
        if (pathname.startsWith("/admin") && data.user?.role !== "admin") {
          console.log(
            "AuthContext: Non-admin on /admin route, redirecting to /"
          );
          toast.error("Access Denied: Admin routes are restricted.");
          router.replace("/"); // Replace to clear history
        } else if (
          data.user?.role === "admin" &&
          (pathname.startsWith("/dashboard") ||
            pathname.startsWith("/profile") ||
            pathname.startsWith("/cart"))
        ) {
          console.log(
            "AuthContext: Admin on user route, redirecting to /admin"
          );
          toast.error("Access Denied: Admins cannot access user routes.");
          router.replace("/admin"); // Replace to clear history
        } else if (pathname === "/" && data.user?.role === "user") {
          console.log("AuthContext: User on /, redirecting to /dashboard");
          router.replace("/dashboard"); // Replace to clear history
        } else if (pathname === "/" && data.user?.role === "admin") {
          console.log("AuthContext: Admin on /, redirecting to /admin");
          router.replace("/admin"); // Replace to clear history
        }
      } else {
        console.log("AuthContext: Unauthorized, clearing user state");
        if (!loginCompleted) {
          setUser(null);
          setIsAdmin(false);
          userCache.current = null;
          setPostLogout(true); // Set post-logout flag
          // No toast for failed verification to avoid confusion
        }
        // Redirect from protected routes
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/cart")
        ) {
          console.log(
            "AuthContext: Unauthenticated on protected route, redirecting to /"
          );
          router.replace("/"); // Replace to clear history
        }
      }
    } catch (error) {
      console.error("AuthContext: Verification error:", error);
      if (!loginCompleted) {
        setUser(null);
        setIsAdmin(false);
        userCache.current = null;
        setPostLogout(true); // Set post-logout flag
        toast.error("Authentication error. Please try again.");
      }
      if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/cart")
      ) {
        console.log(
          "AuthContext: Unauthenticated on protected route, redirecting to /"
        );
        router.replace("/"); // Replace to clear history
      }
    } finally {
      setLoading(false);
      isVerifying.current = false;
    }
  }, [pathname, isLoggingOut, loginCompleted, user]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  const login = async (email: string, password: string) => {
    console.log("AuthContext: Attempting login for", email);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Login successful, user:", data.user);
        setUser(data.user); // Set user state immediately
        userCache.current = data.user; // Cache user
        setPostLogout(false); // Reset post-logout flag
        const admin = data.user?.role === "admin";
        setIsAdmin(admin);
        setLoginCompleted(true); // Lock user state
        // Redirect based on role
        if (data.user?.role === "admin") {
          console.log(
            "AuthContext: Admin logged in, replacing history to /admin"
          );
          router.replace("/admin"); // Replace to clear history
        } else if (data.user?.role === "user") {
          console.log(
            "AuthContext: User logged in, replacing history to /dashboard"
          );
          router.replace("/dashboard"); // Replace to clear history
        }
        await verifyUser(); // Verify to ensure consistency
      } else {
        const errorData = await response.json();
        console.log("AuthContext: Login failed:", errorData.message);
        toast.error("Authentication failed. Please check your credentials.");
        throw new Error(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      toast.error("An error occurred during login. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext: Logging out");
    setIsLoggingOut(true); // Pause verifyUser
    setPostLogout(true); // Set post-logout flag
    userCache.current = null; // Clear cache immediately
    setUser(null); // Clear user state
    setIsAdmin(false); // Clear admin state
    setLoginCompleted(false); // Reset login completed flag
    const promise = fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Logout request failed");
        }
        console.log("AuthContext: Logout successful, replacing history to /");
        router.replace("/"); // Replace to clear history
      })
      .catch((error) => {
        console.error("AuthContext: Logout error:", error);
        toast.error("Logout failed. Please try again.");
        throw error;
      })
      .finally(() => {
        setIsLoggingOut(false); // Re-enable verifyUser
        logoutPromise.current = null;
      });

    logoutPromise.current = promise;
    await promise;
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
