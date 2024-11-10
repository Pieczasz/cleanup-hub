// Components
import Footer from "@/components/Footer";
import Header from "@/components/Header";

// Functions
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1>Text</h1>
        </div>
      </main>
      <Footer />
    </>
  );
}
