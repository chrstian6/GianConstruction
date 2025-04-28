"use client";
import { createContext, useContext, useState } from "react";

interface ModalContextType {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isCreateAccountOpen: boolean;
  setIsCreateAccountOpen: (open: boolean) => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  isLoginOpen: false,
  setIsLoginOpen: () => {},
  isCreateAccountOpen: false,
  setIsCreateAccountOpen: () => {},
  showLogin: true,
  setShowLogin: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        setIsLoginOpen,
        isCreateAccountOpen,
        setIsCreateAccountOpen,
        showLogin,
        setShowLogin,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
