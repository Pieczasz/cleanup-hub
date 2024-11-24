"use client";

// Components
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEvents } from "@/components/UserEvents";
import Image from "next/image";

// Functions
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { api } from "@/trpc/react";

interface ProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

  // Handle loading and not found states
  if (isLoading) {
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
            <div className="mb-8 flex items-center gap-4">
              <Image
                src={user?.image ?? "/defaultAvatar.jpg"}
                alt="Profile picture"
                width={100}
                height={100}
                className="rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-gray-600">
                  Member since{" "}
                  {new Date(user?.createdAt ?? Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Tabs defaultValue="events" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="history">Event History</TabsTrigger>
              </TabsList>
              <TabsContent value="events">
                <UserEvents userId={user?.id} />
              </TabsContent>
              <TabsContent value="history">
                <UserEvents userId={user?.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
}
