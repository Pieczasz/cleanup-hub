"use client";
import AccountForm from "@/components/AccountForm";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";

export default function Account() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="animate-pulse text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">My Profile</h1>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <AccountForm session={session} />
          </TabsContent>
          <TabsContent value="events">
            <UserEvents userId={session?.user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
