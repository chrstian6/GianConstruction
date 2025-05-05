"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface LoginFormProps {
  switchToCreateAccount: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function LoginForm({
  switchToCreateAccount,
  onLogin,
  onClose,
  isLoading,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<{
    message: string;
    type?: "email" | "password" | "general";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!email || !password) {
      setFormError({
        message: "Please fill in all fields",
        type: "general",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError({
        message: "Please enter a valid email address",
        type: "email",
      });
      return;
    }

    try {
      await onLogin(email, password);
      toast.success("Login successful!");
      onClose();
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        const data = await error.response.json();
        errorMessage = data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setFormError({
        message: errorMessage,
        type: "general",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError.message}</AlertDescription>
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
            className={formError?.type === "email" ? "border-destructive" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className={
              formError?.type === "password" ? "border-destructive" : ""
            }
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
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
          onClick={switchToCreateAccount}
          className="font-medium text-primary hover:underline"
          disabled={isLoading}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
