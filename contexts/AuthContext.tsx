// contexts/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender?: string;
  address?: string;
  isActive: boolean;
  tempRegistration: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const login = (userData: AuthUser) => {
    if (userData.isActive && !userData.tempRegistration) {
      setUser(userData);
      router.refresh(); // Force refresh the router to update the UI
    } else {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/check", {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();

      console.log("Auth check response:", data);

      if (data.authenticated && data.user) {
        setUser({
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          contact: data.user.contact || "",
          gender: data.user.gender || "",
          address: data.user.address || "",
          isActive: data.user.isActive !== false, // Default to true if undefined
          tempRegistration: data.user.tempRegistration || false, // Default to false if undefined
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log("User state changed:", user);
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
