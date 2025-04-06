import React from "react";

import Sidebar from "@/components/sidebar";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | ResuMate",
  description: "Your profile information",
};

const ProtectedLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div className="flex h-screen">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-8">{children}</main>
  </div>
);

export default ProtectedLayout;
