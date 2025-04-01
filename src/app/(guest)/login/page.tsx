import React from "react";
import SignIn from "@/components/sign-in";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-6">
        <SignIn />
      </div>
    </div>
  );
};

export default SignInPage;
