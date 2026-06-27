import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  CornerDownLeft,
  ClipboardList,
  BarChart3,
  Users,
  Cog,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  mobile?: boolean;
}

export default function Sidebar({ mobile = false }: SidebarProps) {
  const { profile } = useAuth();
  const role = profile?.role;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("sidebar_collapsed", String(newValue));
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["super_admin", "store_manager", "supervisor", "worker"],
    },
    {
      name: "Materials",
      path: "/materials",
      icon: Package,
      roles: ["super_admin", "store_manager", "supervisor", "worker"],
    },
    {
      name: "Issue Material",
      path: "/transactions/issue",
      icon: ArrowRightLeft,
      roles: ["super_admin", "store_manager", "supervisor"],
    },
    {
      name: "Returns",
      path: "/transactions/returns",
      icon: CornerDownLeft,
      roles: ["super_admin", "store_manager", "supervisor"],
    },
    {
      name: "History",
      path: "/transactions/history",
      icon: ClipboardList,
      roles: ["super_admin", "store_manager"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
      roles: ["super_admin", "store_manager"],
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
      roles: ["super_admin"],
    },
    {
      name: "Machines",
      path: "/machines",
      icon: Cog,
      roles: ["super_admin"],
    },
    {
      name: "Audit Logs",
      path: "/audit",
      icon: ClipboardList,
      roles: ["super_admin"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(role as any)
  );

  return (
    <aside
      className={`relative flex flex-col bg-card/50 transition-all duration-300 ${
        mobile 
          ? "w-full border-none" 
          : `border-r hidden md:flex ${isCollapsed ? "w-20" : "w-64"}`
      }`}
    >

      {/* Brand */}
      <div className={`border-b p-6 flex items-center ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed && !mobile ? 'justify-center' : ''}`}>
          <img
            src="/wintech-pharmachem-equipments-pvt-ltd-removebg-preview.png"
            alt="Wintech Logo"
            className={`h-10 w-auto object-contain shrink-0 ${isCollapsed && !mobile ? 'mx-auto' : ''}`}
          />
          {(!isCollapsed || mobile) && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold leading-tight tracking-tight text-foreground truncate">
                Wintech Pharmachem
              </h2>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                Inventory System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed && !mobile ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${isCollapsed && !mobile ? "justify-center px-0" : ""}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || mobile) && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      {!mobile && (
        <div className={`border-t p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Button
            variant="ghost"
            className={`w-full ${
              isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
            } text-muted-foreground hover:bg-muted hover:text-foreground`}
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}