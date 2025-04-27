"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface LoginFormProps extends React.ComponentProps<"div"> {
  switchToSignUp: () => void;
  onClose?: () => void;
  onLogin: (email: string, password: string) => Promise<any>;
}

interface ApiLoginResponse {
  message?: string;
  error?: string;
  lockout?: boolean;
  remainingMinutes?: number;
  attemptsLeft?: number;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function LoginForm({
  className,
  switchToSignUp,
  onClose,
  onLogin,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockoutInfo, setLockoutInfo] = useState<{
    locked: boolean;
    remainingMinutes: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await onLogin(email, password);
      
      // Reset error states on success
      setError(null);
      setAttemptsLeft(null);
      setLockoutInfo(null);
      
      // Handle successful login
      if (onClose) onClose();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        
        // Check if the error object contains additional data
        const errorObj = err as Error & { 
          lockout?: boolean; 
          remainingMinutes?: number;
          attemptsLeft?: number;
        };
        
        if (errorObj.lockout) {
          setLockoutInfo({
            locked: true,
            remainingMinutes: errorObj.remainingMinutes || 15,
          });
        } else if (errorObj.attemptsLeft !== undefined) {
          setAttemptsLeft(errorObj.attemptsLeft);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 font-poppins", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="font-poppins">Login to your account</CardTitle>
          <CardDescription className="font-poppins">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Error Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="font-poppins">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {/* Lockout Message */}
              {lockoutInfo?.locked && (
                <Alert variant="destructive">
                  <AlertDescription className="font-poppins">
                    Account temporarily locked due to too many failed attempts.
                    Please try again in {lockoutInfo.remainingMinutes} minutes.
                  </AlertDescription>
                </Alert>
              )}
              {/* Attempts Left Warning */}
              {attemptsLeft !== null && !lockoutInfo?.locked && (
                <Alert
                  variant="default"
                  className="bg-yellow-50 border-yellow-200"
                >
                  <AlertDescription className="font-poppins">
                    Warning: {attemptsLeft} login{" "}
                    {attemptsLeft === 1 ? "attempt" : "attempts"} remaining
                    before temporary lockout.
                  </AlertDescription>
                </Alert>
              )}
              {/* Email Field */}
              <div className="grid gap-3">
                <Label htmlFor="email" className="font-poppins">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="email"
                  className="font-poppins"
                />
              </div>
              {/* Password Field */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-poppins">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline font-poppins"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || lockoutInfo?.locked}
                  autoComplete="current-password"
                  className="font-poppins"
                />
              </div>
              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full font-poppins"
                  disabled={isLoading || lockoutInfo?.locked}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full font-poppins"
                  type="button"
                  disabled={isLoading || lockoutInfo?.locked}
                  onClick={() => {
                    // Implement Google login logic here
                  }}
                >
                  Login with Google
                </Button>
              </div>
            </div>
            {/* Sign Up Link */}
            <div className="mt-4 text-center text-sm font-poppins">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={switchToSignUp}
                className="underline underline-offset-4 hover:text-primary font-poppins"
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}