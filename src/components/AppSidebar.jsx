import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Bell,
  MessageSquare,
  Home,
  ReceiptText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const location = useLocation();
  const currentPathname = location.pathname;
  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
    },
    {
      title: "Create PO",
      icon: ReceiptText,
      href: "/purchase-orders",
    },
     {
      title: "Review Invoice",
      icon: FileText,
      href: "/quotes",
    },
    {
      title: "P2P Analytics",
      icon: BarChart3,
      href: "/reports",
    },
  ];

  return (
    <Sidebar className="bg-miracle-darkBlue text-white">
      {" "}
      {/* Added text-white for better contrast if not globally set */}
      <SidebarHeader className="py-4">
        <div className="flex items-center px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-miracle-lightBlue">
            <span className="text-lg fonts-bold text-white">M</span>
          </div>
          <span className="ml-2 text-lg font-semibold">Miraxeon Connect</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item, index) => {
            // Determine if the current item is active
            const isActive = currentPathname === item.href;

            return (
              <SidebarMenuItem
                key={item.title}
                className={`transition-all duration-300 animate-fade-in`}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={`
                    transition-all duration-300 group
                    ${
                      isActive
                        ? "bg-miracle-lightBlue text-white font-semibold shadow-md" // Active styles
                        : "hover:bg-miracle-mediumBlue hover:text-white" // Hover styles for non-active
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link to={item.href}>
                    <item.icon className="transition-transform duration-300 group-hover:scale-110" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hover:bg-miracle-mediumBlue/20 transition-all duration-300">
        <div className="flex items-center gap-2 p-3 transition-all duration-300 hover:bg-sidebar-accent rounded-md hover:bg-none">
          {" "}
          {/* hover:bg-none seems redundant if hover:bg-sidebar-accent is applied */}
          <div className="h-8 w-8 rounded-full bg-miracle-lightBlue flex items-center justify-center text-white">
            <span className="font-semibold">PA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Poornaaditya</span>
            <span className="text-xs text-sidebar-foreground/70">
              Procurement Lead
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
