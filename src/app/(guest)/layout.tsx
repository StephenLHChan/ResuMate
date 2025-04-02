import React from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

const GuestLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div>
    <Navbar />
    <div className="container mx-auto pt-14">{children}</div>
    <Footer />
  </div>
);

export default GuestLayout;
