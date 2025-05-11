"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CreateAccountForm from "@/components/create-account-form";
import OtpVerificationModal from "@/components/otp-verification-modal";

export default function AuthModals() {
  const { login, loading } = useAuth();
  const {
    isLoginOpen,
    setIsLoginOpen,
    isCreateAccountOpen,
    setIsCreateAccountOpen,
  } = useModal();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsCreateAccountOpen(false);
  };

  const openCreateAccountModal = () => {
    setIsLoginOpen(false);
    setIsCreateAccountOpen(true);
  };

  const closeAllModals = () => {
    setIsLoginOpen(false);
    setIsCreateAccountOpen(false);
    setShowOtpModal(false);
  };

  const handleRegistrationSuccess = (email: string) => {
    setUserEmail(email);
    setShowOtpModal(true);
    setIsCreateAccountOpen(false);
  };

  return (
    <>
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Login</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">Loading please wait...</p>
            </div>
          ) : (
            <LoginForm
              switchToCreateAccount={openCreateAccountModal}
              onLogin={login}
              onClose={closeAllModals}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Create Account</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <CreateAccountForm
            switchToLogin={openLoginModal}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        </DialogContent>
      </Dialog>
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={userEmail}
        onSuccess={closeAllModals}
        onResend={async () => {
          // Your resend OTP logic
        }}
        openLoginModal={openLoginModal}
      />
    </>
  );
}
