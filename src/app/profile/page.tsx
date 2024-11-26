"use client";

// Components
import AccountForm from "@/components/AccountForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

import { UserEvents } from "@/components/UserEvents";
import { ParticipatingInEvents } from "@/components/ParticipatingInEvents";
import { PastUserEvents } from "@/components/PastUserEvents";

// Icons
import { StarIcon } from "@heroicons/react/24/solid";

// tRPC
import { api } from "@/trpc/react";

// Functions
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const RatingDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-600">({rating.toFixed(2)})</span>
  </div>
);

export default function Account() {
  const { data: session, status } = useSession();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const router = useRouter();
  const { data: userRating, isLoading: ratingLoading } =
    api.post.getUserRating.useQuery(
      { userId: session?.user.id ?? "" },
      { enabled: status === "authenticated" },
    );

  // Redirect if not authenticated
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/signIn");
    }
  }, [session, status, router]);

  if (status === "loading" || ratingLoading) {
    return (
      <PageLayout>
        <MaxWidthWrapper>
          <div className="w-full">
            <div className="mb-8 flex animate-pulse items-center justify-between bg-gray-200">
              <div className="flex animate-pulse items-center gap-4 bg-gray-200">
                <div className="h-24 w-24 animate-pulse rounded-full bg-gray-100" />
                <div>
                  <div className="mb-2 h-8 w-48 animate-pulse bg-gray-100" />
                  <div className="h-4 w-32 animate-pulse bg-gray-100" />
                </div>
              </div>
              <div className="mr-2 h-10 w-24 animate-pulse bg-gray-100" />
            </div>
            <div className="mb-4 h-10 w-full animate-pulse bg-gray-200" />
            <div className="h-64 w-full animate-pulse bg-gray-200" />
          </div>
        </MaxWidthWrapper>
      </PageLayout>
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
            <div className="flex items-center gap-4">
              <Image
                src={session?.user.image ?? "/defaultAvatar.jpg"}
                alt="Profile picture"
                width={100}
                height={100}
                className="rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold">{session?.user.name}</h1>
                {userRating && (
                  <div className="mt-2">
                    <RatingDisplay rating={userRating.average} />
                    <p className="text-sm text-gray-500">
                      {userRating.totalRatings} ratings
                    </p>
                  </div>
                )}
              </div>
            </div>
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
              <TabsTrigger value="participating" className="w-full">
                Participating in Events
              </TabsTrigger>
              <TabsTrigger value="past" className="w-full">
                Past Events
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <AccountForm session={session} />
            </TabsContent>
            <TabsContent value="events">
              <UserEvents userId={session?.user.id} />
            </TabsContent>
            <TabsContent value="participating">
              <ParticipatingInEvents userId={session?.user.id} />
            </TabsContent>
            <TabsContent value="past">
              <PastUserEvents userId={session?.user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
}
