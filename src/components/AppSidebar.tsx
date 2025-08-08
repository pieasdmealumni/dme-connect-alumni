import { 
  Home, 
  Users, 
  User, 
  Settings, 
  BarChart3, 
  Calendar,
  Briefcase,
  LogOut,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Alumni Directory", url: "/directory", icon: Users },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: BarChart3 },
  { title: "User Management", url: "/admin/users", icon: Shield },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut, isAdmin } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-primary font-semibold">
            PIEAS DME Alumni
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-primary font-semibold">
              Administration
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {profile && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-sm text-sidebar-foreground mb-2">
              {profile.full_name}
            </div>
            <div className="text-xs text-sidebar-foreground/70 mb-3">
              {profile.role.replace('_', ' ').toUpperCase()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}