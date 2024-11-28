"use client";

// Components
import LoginForm from "@/components/auth/LoginForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user.email) {
      router.push("/");
    }
  }, [session, router]);

  if (!session?.user.email) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  return null;
};

export default Page;
