// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";
import Image from "next/image";

const About = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="mb-16 flex flex-col gap-y-24">
          <div className="mt-16 flex w-full flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex flex-col items-start justify-start gap-y-8 text-left">
              <h2 className="text-4xl font-bold">About Cleanup Hub</h2>
              <p className="max-w-2xl text-lg">
                <span className="font-semibold">Welcome to Cleanup Hub!</span>{" "}
                We are dedicated to making the world a cleaner and greener
                place. Our mission is to organize and promote community-driven
                cleanup events, tree planting activities, and other volunteering
                opportunities that help protect and preserve our environment.
              </p>
              <p className="max-w-2xl text-lg">
                Join us in our efforts to create a sustainable future. Whether
                you are an individual looking to make a difference or an
                organization seeking to collaborate on environmental projects,
                Cleanup Hub is here to support you. Together, we can achieve
                great things!
              </p>
              <p className="max-w-2xl text-lg">
                Explore our website to learn more about our upcoming events,
                volunteer opportunities, and how you can get involved.
                Let&apos;s work together to make our communities cleaner,
                healthier, and more beautiful.
              </p>
              <p className="max-w-2xl text-lg">
                <span className="font-semibold">
                  Thank you for being a part of the Cleanup Hub community!
                </span>
              </p>
            </div>
            <Image
              src={"/cleanupHubAboutUs.jpeg"}
              width={500}
              height={750}
              alt="Minimalistic illustration representing Earth-themed elements"
              className="rounded-[100px]"
            />
          </div>
          <div className="mt-16 flex w-full flex-col items-center justify-between gap-8 lg:flex-row">
            <Image
              src={"/imageOfMe.jpg"}
              width={500}
              height={750}
              alt="Illustration of the creator of CleanupHub"
              className="hidden rounded-[100px] lg:block"
            />
            <div className="flex flex-col items-start justify-start gap-y-8 text-left">
              <h2 className="text-4xl font-bold">About The Creator</h2>
              <p className="max-w-2xl text-lg">
                <span className="font-semibold">Hi there!</span> My name is
                Bartłomiej Piekarz, and I am the founder of CleanupHub. I am
                full-stack developer from Poland, passionate about technology
                and the psychology. I created CleanupHub to combine my love for
                coding with my desire to make a positive impact on the world.
              </p>
              <p className="max-w-2xl text-lg">
                I believe that small actions can lead to big changes, and I am
                committed to empowering others to take action and create a
                better future for our planet. Together, we can make a
                difference!
              </p>
              <p className="max-w-2xl text-lg">
                This project was initialy created as a project for hackathon and
                was later developed into a full-fledged platform. I hope that
                CleanupHub will inspire you to get involved in environmental
                initiatives and work towards a more sustainable world.
              </p>
              <p className="max-w-2xl text-lg">
                I should also mention that I wouldn&apos;t thought of creating
                this kind of up without my girlfriend, who is also passionate
                about environmental conservation. She is the one who inspired me
                to take action and create CleanupHub.
              </p>
            </div>
            <Image
              src={"/imageOfMe.jpg"}
              width={500}
              height={750}
              alt="Illustration of the creator of CleanupHub"
              className="block rounded-[100px] lg:hidden"
            />
          </div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default About;
