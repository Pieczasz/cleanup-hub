"use client";
// Components
import Image from "next/image";
import { Button } from "./ui/button";
import MaxWidthWrapper from "./MaxWidthWrapper";

// Functions
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <MaxWidthWrapper>
      <div className="mt-16 flex w-full flex-col items-center justify-between lg:flex-row">
        <div className="flex flex-col">
          <h1 className="pb-4 text-7xl font-bold">
            Let’s Clean <br />
            Together!
          </h1>
          <h3 className="pb-10 text-2xl font-semibold">
            Turn your concern for the <br />
            planet into action with <br />
            CleanupHub. Find cleaning <br />
            events nearby!
          </h3>
          <Button
            className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
            onClick={() => {
              router.push("/events");
            }}
          >
            Join a Clean-Up
          </Button>
        </div>
        <Image
          src="/CleanupHubLogo.png"
          alt="Hero section image"
          width={512}
          height={512}
          className="hidden lg:block"
        />
      </div>
    </MaxWidthWrapper>
  );
};

export default Hero;
