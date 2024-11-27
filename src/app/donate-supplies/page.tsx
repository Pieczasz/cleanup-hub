// Components
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const DonateSupplies = () => {
  return (
    <PageLayout>
      <MaxWidthWrapper>
        <div className="my-16 flex flex-col gap-y-4">
          <h2 className="text-4xl font-bold">How to Donate Supplies</h2>
          <ol className="list-inside list-decimal">
            <li className="text-lg">
              Search for the event you want to donate to.
            </li>
            <li className="text-lg">
              Click the &quot;Donate&quot; button next to the event.
            </li>
            <li className="text-lg">Select the amount you wish to donate.</li>
            <li className="text-lg">Enter your card credentials.</li>
            <li className="text-lg">
              Stripe will securely process your donation.
            </li>
          </ol>
          <p className="text-xl">
            Note: An 8% fee will be charged for the transaction.
          </p>
        </div>
      </MaxWidthWrapper>
    </PageLayout>
  );
};

export default DonateSupplies;
