"use client";

// Components
import AccountForm from "@/components/AccountForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { UserParticipatedEvents } from "@/components/UserParticipatedEvents";

// Functions
import { useSession } from "next-auth/react";

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
            <h1 className="mb-12 text-3xl font-bold sm:mb-6">My Profile</h1>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4 flex w-full flex-col gap-2 sm:flex-row">
                <TabsTrigger value="profile" className="w-full">
                  Profile Settings
                </TabsTrigger>
                <TabsTrigger value="events" className="w-full">
                  My Events
                </TabsTrigger>
                <TabsTrigger value="participated" className="w-full">
                  Participated Events
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <AccountForm session={session} />
              </TabsContent>
              <TabsContent value="events">
                <UserEvents userId={session?.user.id} />
              </TabsContent>
              <TabsContent value="participated">
                <UserParticipatedEvents userId={session?.user.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
}
