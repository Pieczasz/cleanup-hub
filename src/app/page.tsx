// Components
import Hero from "@/components/Hero";
import HowYouCanGetInvolved from "@/components/HowYouCanGetInvolved";
import MostPopularEvents from "@/components/MostPopularEvents";
import MostPopularQuestions from "@/components/MostPopularQuestions";
import OurGoal from "@/components/OurGoal";
import PageLayout from "@/components/PageLayout";

export default async function Home() {
  return (
    <PageLayout>
      <div className="flex w-full flex-col items-center justify-center gap-y-32">
        <Hero />
        <MostPopularEvents />
        <OurGoal />
        <HowYouCanGetInvolved />
        <MostPopularQuestions />
      </div>
    </PageLayout>
  );
}
