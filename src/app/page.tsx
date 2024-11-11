// Components
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageLayout from "@/components/PageLayout";

// Functions
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <PageLayout>
      <div></div>
    </PageLayout>
  );
}
