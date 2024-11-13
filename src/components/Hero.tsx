import Image from "next/image";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <div className="flex w-full flex-col items-center justify-between lg:flex-row">
      <div className="flex flex-col">
        <h1 className="pb-4 text-6xl font-bold">
          Let’s Clean <br />
          Together!
        </h1>
        <h3 className="pb-10 text-xl font-semibold">
          Turn your concern for the planet into action with CleanupHub. Find
          cleaning events nearby!
        </h3>
        <Button className="max-w-[12rem] bg-[#6AA553] text-lg text-white">
          Join a Clean-Up
        </Button>
      </div>
      {/* //TODO: Maybe make something with image on mobile */}
      <Image
        src="/CleanupHubLogo.png"
        alt="Hero section image"
        width={800}
        height={800}
        className="hidden lg:block"
      />
    </div>
  );
};

export default Hero;
