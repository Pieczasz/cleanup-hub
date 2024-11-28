"use client";
// Components
import LoginForm from "@/components/auth/LoginForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user.email) {
    router.push("/");
  } else {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoginForm />
      </div>
    );
  }
};

export default Page;
