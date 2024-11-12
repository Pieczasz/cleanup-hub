"use client";

// Components
import { Button } from "@/components/ui/button";

// Functions
import { signIn } from "next-auth/react";

// Icons
import { FcGoogle } from "react-icons/fc";

const Social = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-y-4">
      <Button
        variant="outline"
        className="flex w-full items-center gap-x-2"
        size="lg"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle className="h-6 w-6" />
        Continue with Google
      </Button>
    </div>
  );
};

export default Social;
