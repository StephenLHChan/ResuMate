"use client";

import { motion } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Resumes", href: "/resumes", icon: FileText },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: Send },
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
];

const Sidebar = (): React.ReactElement => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center space-x-2",
            isCollapsed && "justify-center"
          )}
        >
          <Image
            src="/logo_long.png"
            alt="ResuMate Logo"
            width={isCollapsed ? 40 : 180}
            height={isCollapsed ? 40 : 120}
            className="dark:invert"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-accent/50"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map(item => {
          const isActive = pathname === item.href;

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center space-x-3 rounded-lg px-2 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>

              {item.children && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map(child => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isChildActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {child.name}
                        </motion.span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start hover:bg-accent/50",
                isCollapsed && "justify-center"
              )}
            >
              <div className="flex items-center space-x-2">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-sm font-medium">
                      {session?.user?.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </motion.div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
