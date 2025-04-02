import React from "react";

import Sidebar from "@/components/sidebar";

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
