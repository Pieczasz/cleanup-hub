"use client";
import AccountForm from "@/components/AccountForm";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function Account() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="w-full">
          <div>
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
      </MaxWidthWrapper>
    </PageLayout>
  );
}
