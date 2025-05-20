"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  UserX,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdminCreateUserForm from "@/components/admin-create-user-form";
import CreateEmployeeForm from "@/components/CreateEmployeeForm";

const formatName = (name: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const editSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("user"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(1, "Contact number is required"),
    address: z.string().min(1, "Address is required"),
    gender: z.enum(["male", "female", "other"]).optional(),
    _id: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    role: z.enum(["user", "admin"]),
    position: z.string().optional(),
  }),
  z.object({
    type: z.literal("employee"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    contact: z.string().min(1, "Contact number is required"),
    address: z.string().min(1, "Address is required"),
    gender: z.enum(["male", "female", "other"]).optional(),
    _id: z.string(),
    isActive: z.boolean(),
    createdAt: z.string(),
    role: z.enum(["user", "admin"]),
    position: z.string().optional(),
  }),
]);

type EditFormValues = z.infer<typeof editSchema>;

interface Log {
  _id: string;
  action: string;
  adminName: string;
  targetEmail: string;
  targetName: string;
  createdAt: string;
}

interface RowProps {
  entity: EditFormValues;
  index: number;
  page: number;
  usersPerPage: number;
  usersLength: number;
  type: "user" | "employee";
  onEdit: (entity: { type: "user" | "employee"; data: EditFormValues }) => void;
  onToggleActive: (
    id: string,
    type: "user" | "employee",
    isActive: boolean,
    email: string
  ) => void;
}

const UserRow: React.FC<RowProps> = ({
  entity,
  index,
  page,
  usersPerPage,
  usersLength,
  type,
  onEdit,
  onToggleActive,
}) => {
  const nameCellRef = useRef<HTMLTableCellElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    const updateTooltipPosition = () => {
      if (nameCellRef.current) {
        const rect = nameCellRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const tooltipHeight = 200; // Approximate tooltip height
        const tooltipWidth = 300; // Approximate tooltip width

        let top = rect.bottom + 4; // Default: below the cell
        let left = rect.left;

        // If tooltip goes off bottom, position above
        if (top + tooltipHeight > viewportHeight) {
          top = rect.top - tooltipHeight - 4;
        }

        // If tooltip goes off right, shift left
        if (left + tooltipWidth > viewportWidth) {
          left = viewportWidth - tooltipWidth - 8;
        }

        // Ensure tooltip doesn't go off left
        if (left < 8) {
          left = 8;
        }

        setTooltipStyle({
          top: `${top}px`,
          left: `${left}px`,
          position: "fixed",
        });
      }
    };

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition);

    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition);
    };
  }, []);

  return (
    <TableRow className="even:bg-muted/50 hover:bg-gray-100">
      <TableCell className="p-4">
        {type === "user"
          ? (page - 1) * usersPerPage + index + 1
          : (page - 1) * usersPerPage + usersLength + index + 1}
      </TableCell>
      <TableCell
        className="p-4 whitespace-normal relative group"
        ref={nameCellRef}
      >
        {`${formatName(entity.firstName)} ${formatName(entity.lastName)}`}
        <div
          className="hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 max-w-md"
          style={tooltipStyle}
        >
          <div className="text-sm">
            <p>
              <strong>Email:</strong> {entity.email}
            </p>
            <p>
              <strong>Contact:</strong> {entity.contact}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
            <p>
              <strong>Role:</strong> {entity.role}
            </p>
            <p>
              <strong>Position:</strong> {entity.position || "-"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(entity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-4">
        {entity.isActive ? "Active" : "Inactive"}
      </TableCell>
      <TableCell className="p-4 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit({ type, data: entity })}
        >
          <Edit className="size-4 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant={entity.isActive ? "destructive" : "default"}
          onClick={() =>
            onToggleActive(entity._id, type, entity.isActive, entity.email)
          }
        >
          {entity.isActive ? (
            <>
              <UserX className="size-4 mr-1" />
              Set Inactive
            </>
          ) : (
            <>
              <UserCheck className="size-4 mr-1" />
              Set Active
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default function UserManagement() {
  const [adminName, setAdminName] = useState("System");
  const [users, setUsers] = useState<EditFormValues[]>([]);
  const [employees, setEmployees] = useState<EditFormValues[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "user" | "employee">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editEntity, setEditEntity] = useState<
    | { type: "user"; data: EditFormValues }
    | { type: "employee"; data: EditFormValues }
    | null
  >(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const usersPerPage = 10;
  const recentLogsLimit = 5;

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      type: "user",
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      address: "",
      gender: undefined,
      _id: "",
      isActive: false,
      createdAt: "",
      role: "user",
      position: "",
    },
  });

  useEffect(() => {
    const fetchToken = () => {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
      if (tokenCookie) {
        setToken(tokenCookie.split("=")[1]);
      }
    };
    fetchToken();

    const fetchAdminName = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (data.user && data.user.firstName && data.user.lastName) {
          setAdminName(`${data.user.firstName} ${data.user.lastName}`);
        }
      } catch (error) {
        console.error("Failed to fetch admin name:", error);
      }
    };
    fetchAdminName();
  }, [token]);

  useEffect(() => {
    if (editEntity) {
      editForm.reset({
        ...editEntity.data,
        type: editEntity.type,
        gender: editEntity.data.gender || undefined,
        role:
          editEntity.data.role ||
          (editEntity.type === "employee" ? "admin" : "user"),
        position: editEntity.data.position || "",
      });
    }
  }, [editEntity, editForm]);

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
    fetchLogs();
  }, [page, search, typeFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPerPage.toString(),
        search,
        type: "user",
        status: statusFilter,
      });
      const response = await fetch(`/api/users?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (typeFilter === "all" || typeFilter === "user") {
        const formattedUsers = (data.users || []).map((user: any) => ({
          ...user,
          type: "user" as const,
          position: undefined,
        }));
        setUsers(formattedUsers);
        setTotalPages(data.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error("Failed to fetch users", {
        description: "An error occurred while fetching users.",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPerPage.toString(),
        search,
        type: "employee",
        status: statusFilter,
      });
      const response = await fetch(`/api/employees?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      if (typeFilter === "all" || typeFilter === "employee") {
        const formattedEmployees = (data.employees || []).map(
          (employee: any) => ({
            ...employee,
            type: "employee" as const,
            role: employee.role || "admin",
          })
        );
        setEmployees(formattedEmployees);
        setTotalPages(data.totalPages || 1);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      toast.error("Failed to fetch employees", {
        description: "An error occurred while fetching employees.",
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      const sortedLogs = (data.logs || []).sort(
        (a: Log, b: Log) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(sortedLogs);
    } catch (error) {
      toast.error("Failed to fetch logs", {
        description: "An error occurred while fetching logs.",
      });
    }
  };

  const handleEdit = async (values: EditFormValues) => {
    if (!editEntity) return;

    try {
      const endpoint =
        editEntity.type === "user"
          ? `/api/users/${editEntity.data._id}`
          : `/api/employees/${editEntity.data._id}`;
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        contact: values.contact,
        address: values.address,
        gender: values.gender,
        role: values.role,
        targetEmail: values.email,
        action: `${editEntity.type === "user" ? "User" : "Employee"} ${
          values.email
        } updated by ${adminName}`,
      };
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `${
            editEntity.type === "user" ? "User" : "Employee"
          } updated successfully`,
          {
            description: data.message,
          }
        );
        setEditEntity(null);
        editEntity.type === "user" ? fetchUsers() : fetchEmployees();
        fetchLogs();
      } else {
        toast.error(
          `Failed to update ${
            editEntity.type === "user" ? "user" : "employee"
          }`,
          {
            description: data.error,
          }
        );
      }
    } catch (error) {
      toast.error(
        `Failed to update ${editEntity.type === "user" ? "user" : "employee"}`,
        {
          description: "An error occurred while updating.",
        }
      );
    }
  };

  const handleToggleActive = async (
    id: string,
    type: "user" | "employee",
    currentIsActive: boolean,
    email: string
  ) => {
    try {
      const endpoint =
        type === "user" ? `/api/users/${id}` : `/api/employees/${id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          isActive: !currentIsActive,
          targetEmail: email,
          action: `${type === "user" ? "User" : "Employee"} ${email} ${
            currentIsActive ? "deactivated" : "activated"
          } by ${adminName}`,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(
          `${type === "user" ? "User" : "Employee"} ${
            currentIsActive ? "deactivated" : "activated"
          }`,
          {
            description: data.message,
          }
        );
        type === "user" ? fetchUsers() : fetchEmployees();
        fetchLogs();
      } else {
        toast.error(
          `Failed to ${currentIsActive ? "deactivate" : "activate"} ${
            type === "user" ? "user" : "employee"
          }`,
          {
            description: data.error,
          }
        );
      }
    } catch (error) {
      toast.error(
        `Failed to ${currentIsActive ? "deactivate" : "activate"} ${
          type === "user" ? "user" : "employee"
        }`,
        {
          description: "An error occurred while updating status.",
        }
      );
    }
  };

  const displayedLogs = showAllLogs ? logs : logs.slice(0, recentLogsLimit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User & Employee Management</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="size-4" />
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-md"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value as any);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as any);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsUserDialogOpen(true)}>Add New User</Button>
        <Button onClick={() => setIsEmployeeDialogOpen(true)}>
          Add New Employee
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Logs</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Admin Activity Logs</DialogTitle>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto">
              {displayedLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 border-b border-gray-200 last:border-b-0 text-sm min-w-[300px] max-w-[600px] flex flex-wrap items-baseline gap-1"
                >
                  <span className="whitespace-normal">{log.action}</span>
                  <span className="text-xs text-gray-500">
                    on{" "}
                    {format(new Date(log.createdAt), "MMMM d, yyyy - h:mm a")}
                  </span>
                </div>
              ))}
              {displayedLogs.length == 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No logs available.
                </div>
              )}
            </div>
            {logs.length > recentLogsLimit && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                >
                  {showAllLogs ? "Show Less" : "Show More"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <AdminCreateUserForm
            onRegistrationSuccess={() => {
              setIsUserDialogOpen(false);
              fetchUsers();
              fetchLogs();
            }}
            onCancel={() => setIsUserDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <CreateEmployeeForm
            onSuccess={() => {
              setIsEmployeeDialogOpen(false);
              fetchEmployees();
              fetchLogs();
            }}
            onCancel={() => setIsEmployeeDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {editEntity && (
        <Dialog open={!!editEntity} onOpenChange={() => setEditEntity(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Edit {editEntity.type === "user" ? "User" : "Employee"}
              </DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEdit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Email"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
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
                        control={editForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
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
                      {editEntity.type === "employee" && (
                        <FormField
                          control={editForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position (Optional)</FormLabel>
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
                      )}
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditEntity(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      <div className="overflow-x-auto">
        <Table className="min-w-full border-separate border-spacing-0 border-t border-b border-gray-200">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="p-4 min-w-[60px] text-left font-semibold">
                ID
              </TableHead>
              <TableHead className="p-4 min-w-[150px] text-left font-semibold">
                Name
              </TableHead>
              <TableHead className="p-4 min-w-[100px] text-left font-semibold">
                Status
              </TableHead>
              <TableHead className="p-4 min-w-[200px] text-left font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <UserRow
                key={user._id}
                entity={user}
                index={index}
                page={page}
                usersPerPage={usersPerPage}
                usersLength={users.length}
                type="user"
                onEdit={setEditEntity}
                onToggleActive={handleToggleActive}
              />
            ))}
            {employees.map((employee, index) => (
              <UserRow
                key={employee._id}
                entity={employee}
                index={index}
                page={page}
                usersPerPage={usersPerPage}
                usersLength={users.length}
                type="employee"
                onEdit={setEditEntity}
                onToggleActive={handleToggleActive}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && employees.length === 0 && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Results</AlertTitle>
          <AlertDescription>
            No users or employees found. Try adjusting your search or filters,
            or add a new user or employee.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mt-6">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          variant="outline"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          variant="outline"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
