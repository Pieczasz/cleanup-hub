"use client";

// Components
import PageLayout from "@/components/PageLayout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

// Functions
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

// Types
import type { Event } from "@/server/db/schema";

interface PostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const EventPage = ({ params }: PostPageProps) => {
  const [slug, setSlug] = useState<string | null>(null);
  const [isSlugResolved, setIsSlugResolved] = useState(false);

  // Unwrap the params Promise and set the slug. This is because getting slug directly without promise will not work in future versions of Next.js
  useEffect(() => {
    params
      .then((resolvedParams) => {
        setSlug(resolvedParams.slug?.join(""));
        setIsSlugResolved(true); // Mark slug as resolved
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  // Always call the useQuery hook, but disable it if the slug is not ready
  const { data, isLoading, error } = api.post.getEventById.useQuery(
    { id: slug ?? "" }, // Provide a fallback to prevent errors
    {
      enabled: isSlugResolved && !!slug, // Execute only after slug is resolved
    },
  );

  // Ensure we handle array data safely
  const event = Array.isArray(data) ? (data[0] as Event) : data;

  // Redirect to 404 if no event is found and not loading
  if (isSlugResolved && !isLoading && !event) {
    notFound();
  }

  return (
    <PageLayout>
      <MaxWidthWrapper>
        {isLoading ? (
          <div></div>
        ) : error ? (
          <p className="text-center text-xl font-semibold text-red-500">
            Error loading event details
          </p>
        ) : (
          event && (
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="mt-2">{event.description}</p>
              {/* Uncomment and implement the handleJoinEvent function if required */}
              {/* <button onClick={handleJoinEvent}>Join Event</button> */}
            </div>
          )
        )}
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default EventPage;
