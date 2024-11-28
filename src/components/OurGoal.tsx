// Components
import Image from "next/image";
import MaxWidthWrapper from "./MaxWidthWrapper";

const OurGoal = () => {
  return (
    <div className="flex w-full flex-col items-center justify-between bg-[#DAFFD8] py-20">
      <MaxWidthWrapper>
        <h2 className="pb-4 text-4xl font-bold">What is Our Goal?</h2>
        <div className="flex flex-col gap-y-8">
          <div className="text-xl">
            <p>
              <span className="font-semibold">Our goal at CleanupHub</span> is
              to bring communities together to create a cleaner, greener, and
              healthier environment for everyone. We believe that small actions,
              like picking up litter or planting trees, can make a big
              difference when we work together. Through organized clean-up
              events, we aim to:
            </p>
          </div>
          <div className="flex w-full flex-col items-center justify-center text-xl lg:flex-row">
            <Image
              src="/EarthImage.png"
              alt="Earth image"
              className="pb-8 lg:pb-0"
              width={180}
              height={180}
            />

            <p className="pl-0 lg:pl-8">
              <span className="font-semibold">
                Restore and Preserve Natural Spaces:{" "}
              </span>
              Help protect parks, beaches, and neighborhoods by removing waste
              and preventing pollution.
            </p>
          </div>
          <div className="text-xl">
            <p>
              <span className="font-semibold">
                Promote Eco-Friendly Habits:{" "}
              </span>
              Encourage recycling, proper waste disposal, and sustainable
              practices to reduce our environmental impact.
            </p>
          </div>
          <div className="text-xl">
            <p>
              <span className="font-semibold">
                Build Stronger Communities:{" "}
              </span>
              Connect people who care about the environment, creating a shared
              sense of responsibility and teamwork.
            </p>
            <div className="flex flex-col items-center justify-center pt-8 text-xl lg:flex-row lg:pt-0">
              <p className="pr-8">
                <span className="font-semibold">Inspire Lasting Change: </span>
                Empower individuals to take part in continuous clean-up efforts
                and environmental initiatives that contribute to a healthier
                planet.
              </p>
              <Image
                src="/LeafImage.png"
                alt="Leaf image"
                className="pt-8 lg:pt-0"
                width={180}
                height={180}
              />
            </div>
            <p className="pt-8 text-center">
              Join us in making a meaningful difference—one clean-up at a time!
            </p>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default OurGoal;
