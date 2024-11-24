"use client";
import AccountForm from "@/components/AccountForm";
import { useSession } from "next-auth/react";

export default function Account() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
        {status === "loading" ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <div className="animate-pulse text-gray-400">
              Loading profile...
            </div>
          </div>
        ) : (
          <AccountForm session={session} />
        )}
      </div>
    </div>
  );
}
