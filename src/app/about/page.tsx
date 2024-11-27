import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";
import Image from "next/image";
import React from "react";

const About = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="w-full flex-row justify-between">
          <div className="mt-16 flex w-full flex-col items-start justify-start gap-y-8 text-left">
            <h1 className="text-4xl font-bold">About Cleanup Hub</h1>
            <p className="max-w-2xl text-lg">
              Welcome to Cleanup Hub! We are dedicated to making the world a
              cleaner and greener place. Our mission is to organize and promote
              community-driven cleanup events, tree planting activities, and
              other volunteering opportunities that help protect and preserve
              our environment.
            </p>
            <p className="max-w-2xl text-lg">
              Join us in our efforts to create a sustainable future. Whether you
              are an individual looking to make a difference or an organization
              seeking to collaborate on environmental projects, Cleanup Hub is
              here to support you. Together, we can achieve great things!
            </p>
            <p className="max-w-2xl text-lg">
              Explore our website to learn more about our upcoming events,
              volunteer opportunities, and how you can get involved. Let&apos;s
              work together to make our communities cleaner, healthier, and more
              beautiful.
            </p>
            <p className="max-w-2xl text-lg">
              Thank you for being a part of the Cleanup Hub community!
            </p>
          </div>
          <div></div>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default About;
