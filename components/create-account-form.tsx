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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import OtpVerificationModal from "./otp-verification-modal";

interface CreateAccountFormProps {
  switchToLogin: () => void;
  onRegistrationSuccess: (email: string, password:string) => void;

}
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  address: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

export default function CreateAccountForm({
  switchToLogin,
}: CreateAccountFormProps) {
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
      gender: "prefer-not-to-say",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  // Watch for changes in password fields to validate matching
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

  // Validate password match
  const validatePasswordMatch = (value: string) => {
    return value === form.getValues("password") || "Passwords do not match";
  };

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Check if passwords match
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Send request to generate OTP with all user details
      const otpResponse = await fetch("/api/send-registration-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          contact: values.contact,
          address: values.address,
          gender: values.gender,
        }),
      });

      const otpData = await otpResponse.json();
      if (otpResponse.ok) {
        // Store form values for later submission after OTP verification
        setFormValues(values);
        // Show OTP dialog
        setShowOtpDialog(true);
      } else {
        setError(otpData.message || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while sending verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP success
  const handleOtpSuccess = async () => {
    if (!formValues) return;

    try {
      // Verify OTP
      const verifyResponse = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formValues.email, otp: "123456" }), // Replace "123456" with actual OTP input
      });

      const verifyData = await verifyResponse.json();
      if (verifyResponse.ok) {
        // Close OTP dialog and show success dialog
        setShowOtpDialog(false);
        setShowSuccessDialog(true);
      } else {
        setError(verifyData.message || "Failed to verify OTP.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("An error occurred while verifying OTP. Please try again.");
    }
  };
  // Handle OTP resend
  const handleResendOtp = async () => {
    if (!formValues) return;

    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formValues.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Failed to resend verification code.");
    }
  };

  // Close success dialog and redirect to login
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    form.reset();
    switchToLogin();
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Error or Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{ required: "First name is required" }}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{ required: "Last name is required" }}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          type="email"
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                />

                {/* Contact */}
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    required: "Phone number is required",
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits",
                    },
                  }}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St, City"
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary">
                            <SelectValue placeholder="Select your gender" />
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

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="focus-visible:ring-2 focus-visible:ring-primary pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className={`focus-visible:ring-2 focus-visible:ring-primary pr-10 ${
                              !passwordMatch && field.value
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      {!passwordMatch && field.value && (
                        <p className="text-sm font-medium text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                  rules={{
                    required: "Please confirm your password",
                    validate: validatePasswordMatch,
                  }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading || !passwordMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Already Have an Account? */}
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

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        email={formValues?.email || ""}
        onSuccess={handleOtpSuccess}
        onResend={handleResendOtp}
        openLoginModal={switchToLogin}
      />

      {/* Success Dialog */}
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
