"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";

interface CreateAccountFormProps {
  switchToLogin: () => void;
  onRegistrationSuccess: (email: string, password: string) => void;
  className?: string;
}

const baseFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Address is required"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  otp: z.string().optional(),
});

const formSchema = baseFormSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

const otpFormSchema = baseFormSchema
  .extend({
    otp: z
      .string()
      .min(6, "OTP must be 6 characters")
      .max(6, "OTP must be 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function CreateAccountForm({
  switchToLogin,
  onRegistrationSuccess,
  className,
}: CreateAccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(otpSent ? otpFormSchema : formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      gender: "prefer-not-to-say",
      password: "",
      confirmPassword: "",
      otp: "",
    },
    mode: "onChange",
  });

  // Watch form state for debugging
  const formState = form.formState;
  useEffect(() => {
    console.log("User Form state:", {
      isValid: formState.isValid,
      errors: formState.errors,
      isSubmitting: formState.isSubmitting,
      emailAvailable,
      emailError,
    });
  }, [formState, emailAvailable, emailError]);

  // Real-time email validation
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (!email || !z.string().email().safeParse(email).success) {
        setEmailAvailable(null);
        setEmailError(null);
        return;
      }

      try {
        const response = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();

        if (response.ok && data.available) {
          setEmailAvailable(true);
          setEmailError(null);
        } else {
          setEmailAvailable(false);
          setEmailError(data.error || "Email already registered");
        }
      } catch (err) {
        setEmailAvailable(false);
        setEmailError("Failed to check email availability");
      }
    }, 500),
    []
  );

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "email") {
        checkEmailAvailability(value.email || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, checkEmailAvailability]);

  const sendOtp = async (values: FormValues) => {
    console.log("Sending OTP with values:", values);
    setIsLoading(true);
    try {
      const response = await fetch("/api/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error("Failed to send OTP", {
          description: data.error || "An error occurred",
        });
        return false;
      }
      toast.success("OTP sent to your email");
      setOtpSent(true);
      return true;
    } catch (err: any) {
      toast.error("Failed to send OTP", {
        description: err.message || "An error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (values: FormValues) => {
    console.log("Verifying OTP with values:", values);
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: values.otp, email: values.email }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error("Failed to verify OTP", {
          description: data.error || "Invalid OTP",
        });
        return false;
      }

      toast.success("Account created successfully", {
        description: data.message,
      });
      setShowSuccessDialog(true);
      return true;
    } catch (err: any) {
      toast.error("Failed to create account", {
        description: err.message || "An error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return false;
    }
    console.log("Resending OTP for email:", email);
    setIsLoading(true);
    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error("Failed to resend OTP", {
          description: data.error || "An error occurred",
        });
        return false;
      }
      toast.success("OTP resent to your email");
      form.setValue("otp", "");
      return true;
    } catch (err: any) {
      toast.error("Failed to resend OTP", {
        description: err.message || "An error occurred",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values, "otpSent:", otpSent);
    if (!otpSent) {
      const success = await sendOtp(values);
      if (!success) return;
    } else {
      const success = await verifyOtp(values);
      if (!success) return;
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    form.reset();
    setOtpSent(false);
    setEmailAvailable(null);
    setEmailError(null);
    onRegistrationSuccess(form.getValues().email, form.getValues().password);
    switchToLogin();
  };

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-2xl mx-auto shadow-none border-none",
          className
        )}
      >
        <CardContent className="pt-6">
          <CardHeader>
            <CardTitle className="text-xl text-primary text-center mb-10">
              Create User Account
            </CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage>
                        {emailError && <span>{emailError}</span>}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="flex flex-col min-h-[20px]">
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center px-3"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {otpSent && (
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="flex flex-col min-h-[20px] md:col-span-2">
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 6-digit OTP" {...field} />
                        </FormControl>
                        <FormMessage />
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-sm mt-2"
                          onClick={() => resendOtp(form.getValues().email)}
                          disabled={isLoading || !form.getValues().email}
                        >
                          Resend OTP
                        </Button>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={
                    isLoading ||
                    !form.formState.isValid ||
                    form.formState.isSubmitting ||
                    emailAvailable !== true
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {otpSent ? "Verifying OTP..." : "Sending OTP..."}
                    </>
                  ) : otpSent ? (
                    "Verify OTP and Create Account"
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={switchToLogin}
                >
                  Cancel
                </Button>
              </div>

              {/* Debug UI */}
              <p className="text-sm text-gray-500 mt-2">
                Form Valid: {form.formState.isValid.toString()}, Submitting:{" "}
                {form.formState.isSubmitting.toString()}, Email Available:{" "}
                {emailAvailable?.toString() ?? "N/A"}, Errors:{" "}
                {Object.keys(form.formState.errors).length > 0
                  ? JSON.stringify(form.formState.errors)
                  : "None"}
              </p>

              <p className="text-sm mt-4 text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-primary underline"
                >
                  Login
                </button>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Account Created Successfully!</DialogTitle>
            <DialogDescription>
              Your account has been created. You can now log in with your
              credentials.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleSuccessClose} className="w-full mt-4">
            Go to Login
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
