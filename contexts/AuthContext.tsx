// context/authcontext.tsx
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
  token: string; // Add this line
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: async () => {},
  isLoading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // First check if we have a token in localStorage
        const token = localStorage.getItem("authToken");
        if (token) {
          // If we have a token, verify it client-side first
          const res = await fetch("/api/auth/verify", {
            cache: "force-cache", // Use cached response if available
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (data.verified && data.user) {
            setUser(data.user);
            setIsAdmin(data.user.role === "admin");
            return;
          }
        }

        // If no valid token, clear state
        setUser(null);
        setIsAdmin(false);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up periodic check (every 5 minutes)
    const interval = setInterval(checkAuth, 300000);
    return () => clearInterval(interval);
  }, [pathname]);

  const login = (userData: User) => {
    localStorage.setItem("authToken", userData.token); // Assuming your login returns a token
    setUser(userData);
    setIsAdmin(userData.role === "admin");
    router.push(userData.role === "admin" ? "/admin" : "/dashboard");
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAdmin(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
