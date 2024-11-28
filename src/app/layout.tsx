// tailwind Styles
import "@/styles/globals.css";

// Fonts
import { Lexend } from "next/font/google";

// Metadata
import { type Metadata } from "next";

// tRPC Provider
import { TRPCReactProvider } from "@/trpc/react";

// Components
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Provider from "@/components/Provider";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} lexend`}
      suppressHydrationWarning
    >
      <body>
        <Provider>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCReactProvider>
        </Provider>
      </body>
    </html>
  );
}
