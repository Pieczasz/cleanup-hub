// Components
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import MostPopularEvents from "@/components/MostPopularEvents";
import PageLayout from "@/components/PageLayout";

// Functions
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Home() {
  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="flex w-full flex-col items-center justify-center gap-y-32">
          <Hero />
          <MostPopularEvents />
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
}
