import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResuMate - AI-Powered Resume Generator",
  description: "Generate tailored resumes and cover letters using AI",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
