// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const TermsOfService = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="my-16 flex flex-col gap-y-4">
          <h2 className="text-4xl font-bold">Terms of Service</h2>
          <p className="max-w-2xl text-lg">
            These terms of service (&quot;Terms&quot;) apply to your access and
            use of our services. By using our services, you agree to be bound by
            these Terms.
          </p>
          <h3 className="text-2xl font-semibold">Use of Services</h3>
          <p className="max-w-2xl text-lg">
            You must follow any policies made available to you within the
            services. Do not misuse our services. For example, do not interfere
            with our services or try to access them using a method other than
            the interface and the instructions that we provide.
          </p>
          <h3 className="text-2xl font-semibold">Your Account</h3>
          <p className="max-w-2xl text-lg">
            You may need an account to use some of our services. You are
            responsible for protecting your account and keeping your password
            confidential. You are also responsible for the activity that happens
            on or through your account.
          </p>
          <h3 className="text-2xl font-semibold">Termination</h3>
          <p className="max-w-2xl text-lg">
            We may suspend or terminate your access to our services if you do
            not comply with these Terms or if we are investigating suspected
            misconduct.
          </p>
          <p className="max-w-2xl text-lg">
            If you have 3 unattempted events in a row, your account will be
            banned after an admin reports you.
          </p>
          <p className="max-w-2xl text-lg">
            If you have any questions about these Terms, please contact us.
          </p>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default TermsOfService;
