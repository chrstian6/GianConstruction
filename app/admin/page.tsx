"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building,
  Calendar,
  Clock,
  DollarSign,
  HardHat,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log("AdminDashboard: State:", {
    user: user?.email,
    isAdmin,
    loading,
    pathname,
  });

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/admin")) {
      console.log("AdminDashboard: No user detected, redirecting to /");
      router.push("/");
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Skeleton for Header */}
        <div className="mb-6">
          <div className="h-8 w-1/4 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
        </div>
        {/* Skeleton for Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
        {/* Skeleton for Alerts Section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2].map((_, index) => (
            <AlertCardSkeleton key={index} />
          ))}
        </div>
        {/* Skeleton for Projects Section */}
        <div>
          <div className="flex items-center justify-between mt-6">
            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        </div>
        {/* Skeleton for Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((_, index) => (
            <ChartCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log(
      "AdminDashboard: Non-admin detected, relying on layout redirect"
    );
    return null; // Middleware and layout should handle redirection
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your construction projects and operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value="12"
          icon={<Building className="size-5 text-blue-500" />}
          trend="up"
          trendText="2 new"
        />
        <StatCard
          title="Workers On Site"
          value="48"
          icon={<HardHat className="size-5 text-orange-500" />}
        />
        <StatCard
          title="Budget Utilization"
          value="78%"
          icon={<DollarSign className="size-5 text-green-500" />}
          trend="up"
          trendText="5% from last month"
        />
        <StatCard
          title="Tasks Completed"
          value="124"
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
          trend="up"
          trendText="12% from last week"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertCard
          title="Material Delivery Delay"
          message="Steel beams delivery delayed by 2 days due to supplier issues"
          type="warning"
        />
        <AlertCard
          title="Safety Inspection Passed"
          message="All sites passed the monthly safety inspection"
          type="success"
        />
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-lg font-semibold">Active Projects</h2>
          <button className="text-sm font-medium text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            name="Riverfront Apartments"
            progress={65}
            status="on-track"
            timeline="Due in 45 days"
          />
          <ProjectCard
            name="Downtown Office Complex"
            progress={42}
            status="delayed"
            timeline="Behind by 8 days"
          />
          <ProjectCard
            name="Hillside Villas"
            progress={92}
            status="on-track"
            timeline="Due in 12 days"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Project Progress"
          options={["Last 6 Months", "Last Year", "All Time"]}
        >
          {/* Placeholder for chart */}
          <div className="flex h-64 items-center justify-center rounded-md bg-gray-50 text-muted-foreground">
            Project Progress Chart
          </div>
        </ChartCard>
        <ChartCard
          title="Budget Allocation"
          options={["Current Projects", "All Projects"]}
        >
          {/* Placeholder for chart */}
          <div className="flex h-64 items-center justify-center rounded-md bg-gray-50 text-muted-foreground">
            Budget Allocation Chart
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// Skeleton Components
function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200"></div>
        <div className="size-5 rounded bg-gray-200"></div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="h-8 w-16 rounded bg-gray-200"></div>
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

function AlertCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 bg-gray-50">
      <div className="flex items-start">
        <div className="h-5 w-5 rounded-full bg-gray-200"></div>
        <div className="ml-3 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-4 w-48 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-gray-200"></div>
        <div className="h-5 w-16 rounded bg-gray-200"></div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-4 w-8 rounded bg-gray-200"></div>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200"></div>
      </div>
      <div className="mt-3 flex items-center">
        <div className="mr-1 h-4 w-4 rounded-full bg-gray-200"></div>
        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

function ChartCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-gray-200"></div>
        <div className="h-8 w-24 rounded bg-gray-200"></div>
      </div>
      <div className="mt-4 h-64 rounded-md bg-gray-200"></div>
    </div>
  );
}

// Component Definitions
function StatCard({
  title,
  value,
  icon,
  trend,
  trendText,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendText?: string;
}) {
  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div
            className={`flex items-center text-sm ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            {trendText && <span className="ml-1">{trendText}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: "warning" | "success";
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        type === "warning"
          ? "bg-yellow-50 border-yellow-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === "warning" ? (
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          )}
        </div>
        <div className="ml-3">
          <h3
            className={`text-sm font-medium ${
              type === "warning" ? "text-yellow-800" : "text-green-800"
            }`}
          >
            {title}
          </h3>
          <div
            className={`mt-1 text-sm ${
              type === "warning" ? "text-yellow-700" : "text-green-700"
            }`}
          >
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  name,
  progress,
  status,
  timeline,
}: {
  name: string;
  progress: number;
  status: "on-track" | "delayed" | "completed";
  timeline: string;
}) {
  const statusColors = {
    "on-track": "bg-green-500",
    delayed: "bg-yellow-500",
    completed: "bg-blue-500",
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{name}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]} text-white`}
        >
          {status.replace("-", " ")}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full ${statusColors[status]}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-3 flex items-center text-sm text-muted-foreground">
        <Clock className="mr-1 h-4 w-4" />
        <span>{timeline}</span>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  options,
  children,
}: {
  title: string;
  options: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <select className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-sm">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
