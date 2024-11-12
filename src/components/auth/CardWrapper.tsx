"use client";

// Components
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Header } from "@/components/auth/Header";
import Social from "@/components/auth/Social";

// Interfaces
interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  showSocial?: boolean;
  cardFooterText: string;
  cardFooterHrefText: string;
  cardFooterHref: string;
}

export const CardWrapper = ({
  children,
  headerLabel,
  showSocial,
  cardFooterText,
  cardFooterHrefText,
  cardFooterHref,
}: CardWrapperProps) => {
  return (
    <Card className="lexend mb-10 w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel} text="" />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter className="flex items-center justify-center gap-2">
        <p className="text-sm">{cardFooterText}</p>{" "}
        <a href={cardFooterHref} className="text-sm text-blue-500">
          {cardFooterHrefText}
        </a>
      </CardFooter>
    </Card>
  );
};
