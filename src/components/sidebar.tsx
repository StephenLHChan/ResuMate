"use client";

import {
  FileText,
  Settings,
  LogOut,
  Home,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Send,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/home", icon: Home },
  { name: "My Resume", href: "/resume", icon: FileText },
  { name: "Applications", href: "/application", icon: Send },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    children: [
      { name: "Experience", href: "/profile/experience", icon: Briefcase },
      { name: "Education", href: "/profile/education", icon: GraduationCap },
      { name: "Certifications", href: "/profile/certifications", icon: Award },
      { name: "Projects", href: "/profile/projects", icon: Code2 },
    ],
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar = (): React.ReactElement => {
  const pathname = usePathname();

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/home" className="flex items-center space-x-2">
          <Image
            src="/logo_long.png"
            alt="ResuMate Logo"
            width={180}
            height={120}
            className="dark:invert"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(item => {
          const isActive = pathname === item.href;

          return (
            <div key={item.name}>
              <Link
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

              {item.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map(child => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isChildActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
