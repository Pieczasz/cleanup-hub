// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const About = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="my-16 flex flex-col gap-y-4">
          <h2 className="text-4xl font-bold">How It Works</h2>
          <p className="max-w-2xl text-lg">
            Welcome to our platform. Here is how it works:
          </p>
          <ol>
            <li>Step 1: Sign up for an account.</li>
            <li>Step 2: Customize your profile.</li>
            <li>Step 3: Start using our services.</li>
          </ol>
          <p className="max-w-2xl text-lg">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default About;
