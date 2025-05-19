"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import OtpVerificationModal from "./otp-verification-modal";

interface AdminCreateUserFormProps {
  onRegistrationSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
  gender: string;
  age: number;
  password: string;
  confirmPassword: string;
}

export default function AdminCreateUserForm({
  onRegistrationSuccess,
  onCancel,
}: AdminCreateUserFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      gender: "",
      age: 0,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "password" || name === "confirmPassword") {
        const password = value.password;
        const confirmPassword = value.confirmPassword;
        if (password && confirmPassword) {
          setPasswordMatch(password === confirmPassword);
        } else {
          setPasswordMatch(true);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const validatePasswordMatch = (value: string) => {
    return value === form.getValues("password") || "Passwords do not match";
  };

  const onSubmit = async (values: FormValues) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const otpResponse = await fetch("/api/send-registration-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const otpData = await otpResponse.json();
      if (!otpResponse.ok) {
        throw new Error(otpData.message || "Failed to send OTP.");
      }

      setFormValues(values);
      setShowOtpDialog(true);
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Failed to register user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = async () => {
    if (!formValues) return;

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formValues.email, otp: "123456" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setShowOtpDialog(false);
      setShowSuccessDialog(true);
      onRegistrationSuccess();
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!formValues) return;

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formValues.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code.");
      }

      setError("");
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Failed to resend verification code.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    form.reset();
    onCancel();
  };

  return (
    <>
      <Card className="w-full max-w-lg mx-auto shadow-none">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{ required: "Please enter the first name" }}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{ required: "Please enter the last name" }}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{
                    required: "Please enter the email",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contact Number"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{
                    required: "Please enter the contact number",
                  }}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Address"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{ required: "Please enter the address" }}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Gender</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="text-sm min-w-[120px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male" className="text-sm">
                              Male
                            </SelectItem>
                            <SelectItem value="female" className="text-sm">
                              Female
                            </SelectItem>
                            <SelectItem value="other" className="text-sm">
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{ required: "Please select a gender" }}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Age"
                          className="text-sm w-16"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{
                    required: "Please enter the age",
                    min: { value: 1, message: "Age must be at least 1" },
                    max: { value: 120, message: "Age cannot exceed 120" },
                  }}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="text-sm"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                  rules={{
                    required: "Please enter a password",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel className="text-sm">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="text-sm"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                  rules={{
                    required: "Please confirm the password",
                    validate: validatePasswordMatch,
                  }}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-sm"
                  disabled={isLoading || !passwordMatch}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <OtpVerificationModal
        isOpen={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        email={formValues?.email || ""}
        onSuccess={handleOtpSuccess}
        onResend={handleResendOtp}
        openLoginModal={onCancel}
      />

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              User Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-sm">
              The user account has been created. They can now log in with their
              credentials.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose} className="w-full mt-4 text-sm">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
