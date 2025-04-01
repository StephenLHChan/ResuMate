"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/logout";
import {
  FileText,
  Settings,
  LogOut,
  Home,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/home", icon: Home },
  { name: "My Resume", href: "/resume", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Experience", href: "/experience", icon: Briefcase },
  { name: "Education", href: "/education", icon: GraduationCap },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ResuMate</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-4">
        <form action={handleLogout}>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
