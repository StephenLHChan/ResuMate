"use client";

import React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
        ResuMate
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
        <Button variant="default">Sign In</Button>
      </div>
    </nav>
  );
};

export default Navbar;
