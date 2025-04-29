"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  gender?: string;
  address?: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: async () => {},
  isLoading: true,
  isAdmin: false,
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    if (isCheckingAuth) {
      console.log("AuthContext: checkAuth skipped (already in progress)");
      return;
    }
    setIsCheckingAuth(true);
    setIsLoading(true);
    try {
      console.log("AuthContext: checkAuth started for path:", pathname);
      const res = await fetch("/api/auth/verify", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("AuthContext: checkAuth response:", data);
      if (res.ok && data.user) {
        setUser(data.user);
        setIsAdmin(data.user.role === "admin");
        if (pathname === "/") {
          if (data.user.role === "admin") {
            console.log("AuthContext: Redirecting to /admin");
            router.replace("/admin");
          } else if (data.user.role === "user") {
            console.log(
              "AuthContext: Redirecting to /dashboard (under app/(user)/)"
            );
            router.replace("/dashboard");
          }
        } else {
          console.log("AuthContext: No redirect needed, path:", pathname);
        }
      } else {
        console.log("AuthContext: checkAuth failed:", data.error);
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("AuthContext: checkAuth error:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Handle user login and redirect based on role
  const login = (userData: User) => {
    console.log("AuthContext: login user:", userData);
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    router.replace(userData.role === "admin" ? "/admin" : "/dashboard");
  };

  const logout = async () => {
    console.log("AuthContext: logout started");
    try {
      console.log("AuthContext: Sending fetch to /api/auth/logout");
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      console.log("AuthContext: Fetch response received");
      const data = await response.json();
      console.log("AuthContext: logout API response:", data);
      if (!response.ok) {
        throw new Error(data.error || "Logout failed");
      }
      console.log("AuthContext: Clearing client state");
      setUser(null);
      setIsAdmin(false);
      localStorage.clear();
      sessionStorage.clear();
      console.log("AuthContext: Showing success toast");
      toast.success("Logged out successfully");
      console.log("AuthContext: Redirecting to /");
      router.replace("/");
      setTimeout(() => {
        console.log("AuthContext: Reloading page");
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("AuthContext: logout error:", error);
      console.log("AuthContext: Showing error toast");
      toast.error("Logout Failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      console.log("AuthContext: Clearing client state (fallback)");
      setUser(null);
      setIsAdmin(false);
      localStorage.clear();
      sessionStorage.clear();
      console.log("AuthContext: Redirecting to / (fallback)");
      router.replace("/");
      setTimeout(() => {
        console.log("AuthContext: Reloading page (fallback)");
        window.location.reload();
      }, 100);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAdmin,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
