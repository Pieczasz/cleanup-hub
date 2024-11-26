"use client";

// Components
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";
import { PastUserEvents } from "@/components/PastUserEvents";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/24/solid";
import { ParticipatingInEvents } from "@/components/ParticipatingInEvents";

// Functions
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { api } from "@/trpc/react";

interface ProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const RatingDisplay = ({ rating }: { rating: number }) => {
  return (
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
};

export default function PublicProfile({ params }: ProfilePageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [isSlugResolved, setIsSlugResolved] = useState(false);

  // Handle Promise-based params similar to event page
  useEffect(() => {
    params
      .then((resolvedParams) => {
        if (Array.isArray(resolvedParams.slug)) {
          const userId = resolvedParams.slug.join("/");
          setSlug(userId);
        } else {
          setSlug(resolvedParams.slug);
        }
        setIsSlugResolved(true); // Mark slug as resolved
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  console.log(slug);
  const { data: user, isLoading } = api.post.getUserById.useQuery(
    { id: slug ?? "" },
    {
      enabled: isSlugResolved && !!slug,
    },
  );

  const { data: userRating, isLoading: ratingLoading } =
    api.post.getUserRating.useQuery({ userId: user?.id ?? "" });

  // Handle loading and not found states
  if (isLoading || ratingLoading) {
    return (
      <PageLayout>
        <MaxWidthWrapper>
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </MaxWidthWrapper>
      </PageLayout>
    );
  }

  if (!user && isSlugResolved) {
    notFound();
  }

  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="w-full py-12">
          <div className="rounded-lg bg-white px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center justify-between gap-4">
                <Image
                  src={user?.image ?? "/defaultAvatar.jpg"}
                  alt="Profile picture"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>
                  <div>
                    <h1 className="text-3xl font-bold">{user?.name}</h1>
                    <p className="text-gray-600">
                      Member since{" "}
                      {new Date(
                        user?.createdAt ?? Date.now(),
                      ).toLocaleDateString()}
                    </p>
                  </div>
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
            </div>

            <Tabs defaultValue="events" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="events">User Events</TabsTrigger>
                <TabsTrigger value="participating">
                  Participating in Events
                </TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>
              <TabsContent value="events">
                <UserEvents userId={user?.id} />
              </TabsContent>
              <TabsContent value="participating">
                <ParticipatingInEvents userId={user?.id} />
              </TabsContent>
              <TabsContent value="past">
                <PastUserEvents userId={user?.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
}
