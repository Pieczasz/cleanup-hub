// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const PrivacyPolicy = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="my-16 flex flex-col gap-y-4">
          <h2 className="text-4xl font-bold">Privacy Policy</h2>
          <p className="max-w-2xl text-lg">
            Your privacy is important to us. This privacy policy explains how we
            collect, use, and protect your information.
          </p>
          <h3 className="text-2xl font-semibold">Information Collection</h3>
          <p className="max-w-2xl text-lg">
            We collect information that you provide to us directly, such as when
            you create an account, update your profile, or use our services.
          </p>
          <h3 className="text-2xl font-semibold">Information Use</h3>
          <p className="max-w-2xl text-lg">
            We use the information we collect to provide, maintain, and improve
            our services, to communicate with you, and to protect our users.
          </p>
          <h3 className="text-2xl font-semibold">Information Protection</h3>
          <p className="max-w-2xl text-lg">
            We implement a variety of security measures to maintain the safety
            of your personal information. However, no method of transmission
            over the internet or electronic storage is 100% secure.
          </p>
          <p className="max-w-2xl text-lg">
            If you have any questions about this privacy policy, please contact
            us.
          </p>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default PrivacyPolicy;
