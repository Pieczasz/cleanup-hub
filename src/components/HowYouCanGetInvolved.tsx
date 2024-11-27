"use client";

// Components
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";
import Image from "next/image";

// Functions
import { useRouter } from "next/navigation";

const HowYouCanGetInvolved = () => {
  const router = useRouter();

  const handleHostEvent = () => {
    router.push("/events");
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <MaxWidthWrapper>
        <h2 className="mb-16 text-center text-4xl font-bold">
          How you can <br />
          get involved
        </h2>
        <div className="flex flex-col items-center justify-center gap-y-4">
          <div className="flex flex-col items-center justify-center gap-y-4 lg:flex-row lg:gap-x-24">
            <Image
              src="/Volunteer.png"
              alt="Volunteer image"
              width={400}
              height={400}
            />
            <div className="flex flex-col items-center justify-center lg:items-start">
              <h4 className="mb-2 text-2xl font-semibold">Volunteer</h4>
              <p className="mb-7 text-lg">
                Join our community clean-up events and make a positive impact on
                your local environment. As a volunteer, you’ll help clean up
                parks, beaches, and neighborhoods alongside like-minded
                individuals. Whether you can commit to just one event or
                several, every bit of help counts!
              </p>
              <Button
                className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
                onClick={() => {
                  router.push("/events");
                }}
              >
                Search for Events
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-y-4 lg:flex-row lg:gap-x-24">
            <Image
              src="/Host.png"
              alt="Event organizer image"
              width={400}
              height={400}
              className="block lg:hidden"
            />
            <div className="flex flex-col items-center justify-center lg:items-start">
              <h4 className="mb-2 text-2xl font-semibold">Host an Event</h4>
              <p className="mb-7 text-lg">
                Do you have a location in mind that needs a little extra care?
                Take the lead by hosting your own clean-up event! As a host,
                you’ll coordinate volunteers, set up supplies, and help bring
                our mission to life in your area. We’ll support you with
                resources and tips to make your event successful.
              </p>
              <Button
                className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
                onClick={handleHostEvent}
              >
                Host an Event
              </Button>
            </div>
            <Image
              src="/Host.png"
              alt="Event organizer image"
              width={400}
              height={400}
              className="hidden lg:block"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-4 lg:flex-row lg:gap-x-24">
            <Image
              src="/Donate.png"
              alt="Donate image"
              width={400}
              height={400}
            />
            <div className="flex flex-col items-center justify-center lg:items-start">
              <h4 className="mb-2 text-2xl font-semibold">Donate Supplies</h4>
              <p className="mb-7 text-lg">
                Support our clean-up efforts by donating essential supplies like
                gloves, trash bags, recycling bins, money for specific events,
                or even snacks for volunteers. Your contribution helps keep our
                events running smoothly and ensures volunteers have what they
                need to make a difference.
              </p>
              <Button
                className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
                onClick={() => {
                  router.push("/donate-supplies");
                }}
              >
                Donate Supplies
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default HowYouCanGetInvolved;
