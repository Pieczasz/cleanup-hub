// Types
import type { ReactNode } from "react";

// Components
import Header from "./Header";
import Footer from "./Footer";
import { ToastProvider } from "@/components/ui/toast"

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ToastProvider>
        <Header />
        <main className="flex min-h-screen w-full">
          <div className="flex w-full flex-col">{children}</div>
        </main>
        <Footer />
      </ToastProvider>
    </>
  );
};

export default PageLayout;
