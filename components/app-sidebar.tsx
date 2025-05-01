import * as React from "react";
import {
  Building,
  Hammer,
  Home,
  Minus,
  Plus,
  Settings,
  Users,
  Warehouse,
  ChevronLeft,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Updated data for Gian Construction Admin
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <Home className="size-4" />,
      items: [],
    },
    {
      title: "Projects",
      url: "#",
      icon: <Building className="size-4" />,
      items: [
        {
          title: "Active Projects",
          url: "#",
        },
        {
          title: "Design Catalog",
          url: "/admin/projects/designs", // Moved designs under projects
        },
        {
          title: "Completed Projects",
          url: "#",
        },
        {
          title: "Upcoming Projects",
          url: "#",
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: <Warehouse className="size-4" />,
      items: [
        {
          title: "Materials",
          url: "/admin/inventory/materials",
        },
        {
          title: "Equipment",
          url: "#",
        },
        {
          title: "Suppliers",
          url: "#",
        },
      ],
    },
    {
      title: "Workforce",
      url: "#",
      icon: <Users className="size-4" />,
      items: [
        {
          title: "Employees",
          url: "#",
        },
        {
          title: "Contractors",
          url: "#",
        },
        {
          title: "Attendance",
          url: "#",
        },
        {
          title: "Payroll",
          url: "#",
        },
      ],
    },
    {
      title: "Operations",
      url: "#",
      icon: <Hammer className="size-4" />,
      items: [
        {
          title: "Tasks",
          url: "#",
        },
        {
          title: "Scheduling",
          url: "#",
        },
        {
          title: "Site Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings className="size-4" />,
      items: [
        {
          title: "Company Profile",
          url: "#",
        },
        {
          title: "User Management",
          url: "#",
        },
        {
          title: "Preferences",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Gian Construction</span>
                  <span className="">Admin Panel</span>
                </div>
                <ChevronLeft className="ml-auto h-5 w-5 shrink-0" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={item.title === "Projects"} // Open Projects by default
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.icon}
                      {item.title}{" "}
                      {item.items?.length > 0 && (
                        <>
                          <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                          <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>{subItem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
