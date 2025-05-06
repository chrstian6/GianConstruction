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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [postLogout, setPostLogout] = useState(false);
  const [loginCompleted, setLoginCompleted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userCache = useRef<User | null>(null);
  const isVerifying = useRef(false);
  const isMounted = useRef(false);
  const logoutPromise = useRef<Promise<void> | null>(null);
  const lastVerifyTime = useRef<number>(0);

  // Utility to clear browser history
  const clearHistory = (path: string) => {
    if (typeof window !== "undefined") {
      for (let i = 0; i < 100; i++) {
        window.history.pushState(null, "", path);
      }
      window.history.replaceState(null, "", path);
      window.history.scrollRestoration = "manual";
      window.onpopstate = () => {
        window.location.href = path;
      };
    }
  };

  const verifyUser = useCallback(async () => {
    // Skip if logging out, post-logout, or logout in progress
    if (isLoggingOut || postLogout || logoutPromise.current) {
      console.log(
        `AuthContext: Skipping verifyUser (isLoggingOut: ${isLoggingOut}, postLogout: ${postLogout}, logoutPromise: ${!!logoutPromise.current})`
      );
      if (logoutPromise.current) {
        await logoutPromise.current;
      }
      return;
    }

    // Skip if already verifying
    if (isVerifying.current) {
      console.log("AuthContext: Skipping verifyUser (isVerifying: true)");
      return;
    }

    // Debounce: Skip if called within 500ms
    const now = Date.now();
    if (now - lastVerifyTime.current < 500) {
      console.log("AuthContext: Skipping verifyUser (debounced)");
      return;
    }
    lastVerifyTime.current = now;

    console.log("AuthContext: Executing verifyUser, pathname:", pathname);
    isVerifying.current = true;

    try {
      // Use cached user if available
      if (userCache.current) {
        console.log("AuthContext: Using cached user:", userCache.current);
        if (!user || !loginCompleted) {
          setUser(userCache.current);
          setIsAdmin(userCache.current?.role === "admin");
        }
        // Skip redirect if on correct route
        if (
          (userCache.current?.role === "admin" && pathname === "/admin") ||
          (userCache.current?.role === "user" &&
            (pathname === "/dashboard" ||
              pathname.startsWith("/profile") ||
              pathname.startsWith("/cart")))
        ) {
          console.log(
            "AuthContext: Already on correct route, skipping redirect"
          );
          setLoading(false);
          return;
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
          window.location.href = "/";
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
          window.location.href = "/admin";
        } else if (pathname === "/" && userCache.current?.role === "user") {
          console.log("AuthContext: User on /, redirecting to /dashboard");
          window.location.href = "/dashboard";
        } else if (pathname === "/" && userCache.current?.role === "admin") {
          console.log("AuthContext: Admin on /, redirecting to /admin");
          window.location.href = "/admin";
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
        userCache.current = data.user;
        setPostLogout(false);
        setIsAdmin(data.user?.role === "admin");
        // Skip redirect if on correct route
        if (
          (data.user?.role === "admin" && pathname === "/admin") ||
          (data.user?.role === "user" &&
            (pathname === "/dashboard" ||
              pathname.startsWith("/profile") ||
              pathname.startsWith("/cart")))
        ) {
          console.log(
            "AuthContext: Already on correct route, skipping redirect"
          );
          setLoading(false);
          return;
        }
        // Protect routes
        if (pathname.startsWith("/admin") && data.user?.role !== "admin") {
          console.log(
            "AuthContext: Non-admin on /admin route, redirecting to /"
          );
          toast.error("Access Denied: Admin routes are restricted.");
          window.location.href = "/";
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
          window.location.href = "/admin";
        } else if (pathname === "/" && data.user?.role === "user") {
          console.log("AuthContext: User on /, redirecting to /dashboard");
          window.location.href = "/dashboard";
        } else if (pathname === "/" && data.user?.role === "admin") {
          console.log("AuthContext: Admin on /, redirecting to /admin");
          window.location.href = "/admin";
        }
      } else {
        console.log("AuthContext: Unauthorized, clearing user state");
        if (!loginCompleted) {
          setUser(null);
          setIsAdmin(false);
          userCache.current = null;
          setPostLogout(true);
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
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("AuthContext: Verification error:", error);
      if (!loginCompleted) {
        setUser(null);
        setIsAdmin(false);
        userCache.current = null;
        setPostLogout(true);
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
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
      isVerifying.current = false;
    }
  }, [loginCompleted, user, isLoggingOut]);

  // Run verifyUser only once on mount or when user/loginCompleted changes
  useEffect(() => {
    if (!isMounted.current) {
      console.log("AuthContext: Initial verifyUser call");
      isMounted.current = true;
      verifyUser();
    }
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
        setUser(data.user);
        userCache.current = data.user;
        setPostLogout(false);
        const admin = data.user?.role === "admin";
        setIsAdmin(admin);
        setLoginCompleted(true);
        const redirectPath = admin ? "/admin" : "/dashboard";
        console.log(`AuthContext: Redirecting to ${redirectPath}`);
        clearHistory(redirectPath);
        window.location.href = redirectPath;
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
    setIsLoggingOut(true);
    setPostLogout(true);
    userCache.current = null;
    setUser(null);
    setIsAdmin(false);
    setLoginCompleted(false);

    // Clear token cookie client-side
    if (typeof window !== "undefined") {
      document.cookie =
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout request failed");
      }
      console.log("AuthContext: Logout successful");
      toast.success("Logged out successfully");
      // Clear history and force reload
      clearHistory("/");
      window.location.href = "/";
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
      toast.error("Logout failed. Please try again.");
      // Still redirect to / on error
      clearHistory("/");
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
      logoutPromise.current = null;
    }
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
