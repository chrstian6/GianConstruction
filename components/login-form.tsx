"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface LoginFormProps {
  switchToSignUp: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function LoginForm({
  switchToSignUp,
  onLogin,
  onClose,
  isLoading,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Clear error when user modifies form
  useEffect(() => {
    setError("");
    // Validate email format
    if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email || !password) {
      const errorMsg = "Please fill in all fields";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (emailError) {
      const errorMsg = "Please correct the email format";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      await onLogin(email, password);
      // onClose() is handled in Navbar's handleLogin
    } catch (err) {
      let errorMsg = "An unexpected error occurred. Please try again.";

      // Handle specific error cases
      if (err instanceof Response) {
        const data = await err.json().catch(() => ({}));
        switch (err.status) {
          case 401:
            errorMsg = data.error || "Invalid email or password";
            break;
          case 404:
            errorMsg = data.error || "User not found";
            break;
          case 403:
            errorMsg =
              data.error || "Account is inactive. Please contact support.";
            break;
          case 429:
            errorMsg =
              data.error || "Too many attempts. Please try again later.";
            break;
          case 500:
            errorMsg = data.error || "Server error. Please try again later.";
            break;
          default:
            errorMsg =
              data.error || "An unexpected error occurred. Please try again.";
        }
      } else if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMsg = "Network error. Please check your connection and try again.";
      } else {
        errorMsg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.";
      }

      setError(errorMsg);
      toast.error(errorMsg, {
        description:
          err instanceof Response ? `Status: ${err.status}` : undefined,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className={`h-10 ${emailError ? "border-destructive" : ""}`}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => {
                const errorMsg =
                  "Forgot password feature is not implemented yet.";
                setError(errorMsg);
                toast.error(errorMsg);
              }}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !!emailError}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={switchToSignUp}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
