// Types
import type { ReactNode } from "react";

// Components
import Header from "./Header";
import Footer from "./Footer";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container flex flex-col items-center justify-center py-16">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PageLayout;
