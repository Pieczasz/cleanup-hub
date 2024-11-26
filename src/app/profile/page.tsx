"use client";

// Components
import AccountForm from "@/components/AccountForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { UserParticipatedEvents } from "@/components/UserParticipatedEvents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Functions
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Account() {
  const { data: session, status } = useSession();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/signIn");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setShowSignOutDialog(false);
    router.push("/");
  };

  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="w-full">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold sm:mb-6">My Profile</h1>
            {session && (
              <Button
                variant="destructive"
                onClick={() => setShowSignOutDialog(true)}
                className="ml-auto"
              >
                Sign Out
              </Button>
            )}

            <Dialog
              open={showSignOutDialog}
              onOpenChange={setShowSignOutDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign Out</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to sign out?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowSignOutDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
      </MaxWidthWrapper>
    </PageLayout>
  );
}
