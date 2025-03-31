import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/auth";

const SignIn: React.FC = () => {
  const handleGoogleSignIn = async () => {
    "use server";
    await signIn("google");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <Button onClick={handleGoogleSignIn} variant="default">
        Sign in with Google
      </Button>
    </div>
  );
};

export default SignIn;
