"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface ModalContextType {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isCreateAccountOpen: boolean;
  setIsCreateAccountOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  isLoginOpen: false,
  setIsLoginOpen: () => {},
  isCreateAccountOpen: false,
  setIsCreateAccountOpen: () => {},
});

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  useEffect(() => {
    console.log("ModalProvider initialized", {
      isLoginOpen,
      isCreateAccountOpen,
    });
  }, []);

  useEffect(() => {
    console.log("ModalContext: isLoginOpen changed to", isLoginOpen);
  }, [isLoginOpen]);

  useEffect(() => {
    console.log(
      "ModalContext: isCreateAccountOpen changed to",
      isCreateAccountOpen
    );
  }, [isCreateAccountOpen]);

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        setIsLoginOpen,
        isCreateAccountOpen,
        setIsCreateAccountOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
