import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ResuMate - AI-Powered Resume Generator",
    template: "%s | ResuMate",
  },
  description:
    "Generate professional, tailored resumes and cover letters using advanced AI technology. Create job-winning documents in minutes.",
  keywords: [
    "resume builder",
    "AI resume",
    "cover letter generator",
    "job application",
    "career tools",
  ],
  authors: [{ name: "ResuMate Team" }],
  creator: "ResuMate",
  publisher: "ResuMate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://resumate.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ResuMate - AI-Powered Resume Generator",
    description:
      "Generate professional, tailored resumes and cover letters using advanced AI technology.",
    url: "https://resumate.app",
    siteName: "ResuMate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResuMate - AI Resume Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResuMate - AI-Powered Resume Generator",
    description:
      "Generate professional, tailored resumes and cover letters using advanced AI technology.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
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
