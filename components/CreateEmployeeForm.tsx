"use client";
import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface CreateEmployeeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(1, "Contact number is required"),
    address: z.string().min(1, "Address is required"),
    gender: z.enum(["male", "female", "other"]).optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    position: z.string().min(1, "Position is required"),
    role: z.enum(["user", "admin"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function CreateEmployeeForm({
  onSuccess,
  onCancel,
  className,
}: CreateEmployeeFormProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
      position: "",
      role: "admin",
    },
    mode: "onChange",
  });

  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await fetch(
        `/api/employees?search=${encodeURIComponent(email)}&type=employee`
      );
      const data = await response.json();
      return data.employees.length === 0;
    } catch (err) {
      console.error("Error checking email:", err);
      return true; // Assume available if check fails
    }
  };

  const getToken = async () => {
    // Try cookie first
    const cookies = document.cookie;
    console.log("Cookies:", cookies); // Debug
    let token = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("token="))
      ?.split("=")[1];
    console.log("Cookie Token:", token || "Not found"); // Debug

    // Fallback to /api/auth/verify
    if (!token) {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        const data = await response.json();
        console.log("Verify Response:", data); // Debug
        if (data.token) {
          token = data.token;
          console.log("Fetched Token:", token); // Debug
        }
      } catch (err) {
        console.error("Error fetching token from /api/auth/verify:", err);
      }
    }

    return token;
  };

  const onSubmit = async (values: FormValues) => {
    setError("");
    setIsLoading(true);

    try {
      const isEmailAvailable = await checkEmailAvailability(values.email);
      if (!isEmailAvailable) {
        throw new Error("Email already registered");
      }

      const token = await getToken();
      console.log("Final Token for Request:", token || "None"); // Debug

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          contact: values.contact,
          address: values.address,
          gender: values.gender,
          password: values.password,
          position: values.position,
          role: values.role || "admin",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee.");
      }

      toast.success("Employee created successfully", {
        description: data.message,
      });
      form.reset();
      onSuccess();
    } catch (err: any) {
      console.error("Error creating employee:", err);
      setError(err.message || "Failed to create employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto shadow-none border-none",
        className
      )}
    >
      <CardContent className="pt-6">
        <CardHeader>
          <CardTitle className="text-xl text-primary text-center mb-10">
            Register Employee Account
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                    <FormMessage />
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
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="flex flex-col min-h-[20px]">
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Carpenter, Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex flex-col min-h-[20px]">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Employee...
                  </>
                ) : (
                  "Create Employee"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
