import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { RecentActivity } from "./recent-activity";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { z } from "zod";
import {
  Users,
  Folder,
  DollarSign,
  Package,
  ArrowUp,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Schema definition
export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

// Sample data
const tableData = [
  {
    id: 1,
    header: "Project Alpha",
    type: "Development",
    status: "Active",
    target: "$50,000",
    limit: "$60,000",
    reviewer: "John Doe",
  },
  {
    id: 2,
    header: "Project Beta",
    type: "Design",
    status: "Pending",
    target: "$30,000",
    limit: "$35,000",
    reviewer: "Jane Smith",
  },
  {
    id: 3,
    header: "Project Gamma",
    type: "Marketing",
    status: "Completed",
    target: "$45,000",
    limit: "$50,000",
    reviewer: "Alex Johnson",
  },
];

export function AdminDashboard() {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-6 p-4",
        "sm:p-6 lg:p-8 xl:p-10 2xl:p-12",
        "max-w-screen-2xl mx-auto w-full"
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
        <StatCard
          title="Total Users"
          value="1,234"
          change="+12.3%"
          icon={<Users className="h-4 w-4" />}
          className="sm:col-span-2 lg:col-span-1"
        />
        <StatCard
          title="Active Projects"
          value="56"
          change="+5.2%"
          icon={<Folder className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue"
          value="$23,456"
          change="+8.1%"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Inventory"
          value="1,892"
          change="+3.7%"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Growth Rate"
          value="24.5%"
          change="+2.4%"
          icon={<TrendingUp className="h-4 w-4" />}
          className="hidden 2xl:block"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Main Chart */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px] sm:h-[350px] 2xl:h-[400px]">
            <div className="h-full w-full">
              <ChartAreaInteractive />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="flex flex-col gap-6">
          <RecentActivity />

          {/* Mini Stats - Only shows on larger screens */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <MiniStatCard title="Completion Rate" value="82%" trend="up" />
            <MiniStatCard title="Avg. Time" value="3.2 days" trend="down" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Project Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time updates and status tracking
            </p>
          </div>
          <Badge variant="outline" className="gap-1 text-sm">
            <ArrowUp className="h-3 w-3" />
            Live Data
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px] lg:min-w-full">
              <DataTable data={tableData} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon,
  className,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  className?: string;
}) {
  const isPositive = change.startsWith("+");

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            "text-xs mt-1 flex items-center",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {change} from last period
        </p>
      </CardContent>
    </Card>
  );
}

// Mini Stat Card for secondary metrics
function MiniStatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: "up" | "down";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
        <div
          className={cn(
            "rounded-full p-2",
            trend === "up"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          )}
        >
          <TrendingUp
            className={cn("h-4 w-4", trend === "down" && "rotate-180")}
          />
        </div>
      </div>
    </Card>
  );
}
