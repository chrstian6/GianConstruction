"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dashboard page under app/(user)/dashboard to inherit Navbar from app/(user)/layout.tsx
export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if not logged in or if admin
  useEffect(() => {
    if (loading) {
      console.log("Dashboard: Skipping redirect, isLoading=true");
      return;
    }
    if (!user && !isRedirecting) {
      console.log("Dashboard: No user, scheduling redirect to /");
      setIsRedirecting(true);
      toast.error("Please log in to access the dashboard.");
      setTimeout(() => {
        router.replace("/");
      }, 500); // Delay to allow auth state to settle
    } else if (isAdmin && !isRedirecting) {
      console.log("Dashboard: Admin detected, redirecting to /admin");
      setIsRedirecting(true);
      toast.error("Access Denied: Admins cannot access user dashboard.");
      setTimeout(() => {
        router.replace("/admin");
      }, 500);
    }
  }, [user, loading, isAdmin, router, isRedirecting]);

  // Mock data for the dashboard
  const activeProjects = [
    {
      id: 1,
      name: "Kitchen Renovation",
      status: "In Progress",
      completion: 65,
    },
    { id: 2, name: "Bathroom Remodel", status: "Planning", completion: 15 },
  ];

  const recentTransactions = [
    {
      id: 1,
      date: "Apr 23, 2025",
      description: "Payment for Materials",
      amount: "₱12,500",
    },
    {
      id: 2,
      date: "Apr 18, 2025",
      description: "Initial Deposit",
      amount: "₱25,000",
    },
  ];

  if (loading || !user || isAdmin) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your projects and account activity.
          </p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeProjects.length}</div>
              <p className="text-xs text-gray-500 mt-1">2 in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Completed Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-gray-500 mt-1">
                Last one completed Apr 10
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₱87,500</div>
              <p className="text-xs text-gray-500 mt-1">Last payment Apr 23</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Active Projects</CardTitle>
                <Link href="/dashboard/projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Your current construction projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {project.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>Progress</span>
                      <span>{project.completion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Transactions</CardTitle>
                <Link href="/dashboard/history">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                    <span className="font-semibold">{transaction.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="w-full">Request New Project</Button>
          <Button variant="outline" className="w-full">
            View Materials
          </Button>
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
