"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
  onResend: () => Promise<void>;
  openLoginModal: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
  onResend,
  openLoginModal,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [remainingTime, setRemainingTime] = useState(120);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for OTP expiry
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && remainingTime > 0 && !verificationSuccess) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, remainingTime, verificationSuccess]);

  // Timer logic for resend cooldown
  useEffect(() => {
    let cooldownInterval: NodeJS.Timeout | null = null;
    if (resendCooldown > 0) {
      cooldownInterval = setInterval(() => {
        setResendCooldown((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [resendCooldown]);

  // Auto-hide resend success after 3 seconds
  useEffect(() => {
    let modalTimer: NodeJS.Timeout | null = null;
    if (showResendSuccess) {
      modalTimer = setTimeout(() => {
        setShowResendSuccess(false);
      }, 3000);
    }
    return () => {
      if (modalTimer) clearTimeout(modalTimer);
    };
  }, [showResendSuccess]);

  // Auto-redirect after successful verification
  useEffect(() => {
    let successTimer: NodeJS.Timeout | null = null;
    if (verificationSuccess) {
      successTimer = setTimeout(() => {
        onClose();
        openLoginModal();
        onSuccess();
      }, 3000);
    }
    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [verificationSuccess, onClose, openLoginModal, onSuccess]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(""));
      setError("");
      setRemainingTime(120);
      setLoading(false);
      setVerificationSuccess(false);
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    if (/^\d*$/.test(value) && value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otpInputsRef.current.length - 1) {
        otpInputsRef.current[index + 1]?.focus();
      }
    }

    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === 6) {
      // Optionally trigger verification automatically here
    }
  };

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationSuccess(true);
        setSuccessMessage(
          data.message ||
            "Account verified successfully. Redirecting to login..."
        );
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError("");
      await onResend();
      setRemainingTime(120);
      setResendCooldown(60);
      setShowResendSuccess(true);
    } catch (err) {
      setError("Failed to resend verification code.");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {verificationSuccess
                ? "Verification Successful"
                : "Verify Your Email"}
            </DialogTitle>
            <DialogDescription>
              {verificationSuccess
                ? "Your account has been verified successfully."
                : `Please enter the 6-digit verification code sent to ${email}.`}
            </DialogDescription>
          </DialogHeader>

          {verificationSuccess ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-center">
                  Registration Complete!
                </h3>
                <p className="text-center text-sm text-gray-500">
                  {successMessage}
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    onClose();
                    openLoginModal();
                  }}
                  className="w-full sm:w-auto"
                >
                  Continue to Login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="flex items-center justify-between space-x-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => {
                          otpInputsRef.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") handleBackspace(index);
                        }}
                        className="w-10 text-center focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    ))}
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading || remainingTime === 0 || otp.join("").length < 6
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : remainingTime > 0 ? (
                    `Verify (${Math.floor(remainingTime / 60)}:${String(
                      remainingTime % 60
                    ).padStart(2, "0")})`
                  ) : (
                    "Code Expired"
                  )}
                </Button>
              </form>
              <p className="text-center text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className={`${
                    resendCooldown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-primary hover:underline"
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend (${resendCooldown}s)`
                    : "Resend Code"}
                </button>
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Resend success notification */}
      {showResendSuccess && (
        <div className="fixed top-4 left-1/2 z-50 transform -translate-x-1/2 max-w-sm animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="rounded-md bg-green-50 p-4 shadow-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Verification code sent</p>
                <p className="text-xs text-green-600">
                  A new code has been sent to your email
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
