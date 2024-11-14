// Types
import type { ReactNode } from "react";

// Components
import Header from "./Header";
import Footer from "./Footer";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <main className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">{children}</div>
      </main>
      <Footer />
    </>
  );
};

export default PageLayout;
