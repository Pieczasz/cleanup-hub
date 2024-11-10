import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Lexend } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

// Components
import MaxWidthWrapper from "./components/MaxWidthWrapper";

export const metadata: Metadata = {
  title: "Cleanup Hub",
  description:
    "Turn your concern for the planet into action with CleanupHub. Find cleaning events nearby!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lexend.variable}`}>
      <body>
        <TRPCReactProvider>
          <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
