// lib/auth.ts
import { jwtDecode } from "jwt-decode";

export const verifyTokenClientSide = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
