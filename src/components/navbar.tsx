"use client";

import Link from "next/link";
import React from "react";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="flex items-center justify-between p-4">
      <Link href="/" passHref>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer">
          ResuMate
        </div>
      </Link>
      <div className="flex items-center space-x-4">
        <motion.button
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </motion.button>
        <Link href="/login">
          <Button variant="default">Sign In</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
