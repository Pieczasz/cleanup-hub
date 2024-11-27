"use client";

// Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import PageLayout from "@/components/PageLayout";

const faqs = [
  {
    question: "What is CleanupHub and how does it work?",
    answer:
      "CleanupHub connects individuals and communities to organize or join clean-up events, making environmental action easy and accessible.",
    id: 1,
  },
  {
    question: "How can I join a clean-up event near me?",
    answer:
      "You can find and join clean-up events near you by browsing the event listings on the app or website.",
    id: 2,
  },
  {
    question: "Can I organize my own clean-up event on CleanupHub?",
    answer:
      "Yes, you can create and manage your own clean-up events directly through CleanupHub.",
    id: 3,
  },
  {
    question: "What are the requirements to participate in a clean-up event?",
    answer:
      "Participants should be willing to contribute time and follow safety guidelines. Some events may require specific tools or equipment.",
    id: 4,
  },
  {
    question: "How do I know what supplies to bring to an event?",
    answer:
      "The event organizer usually lists required supplies. Common items include gloves, trash bags, and appropriate clothing.",
    id: 5,
  },
  {
    question: "Do I need to create an account to use CleanupHub?",
    answer:
      "While browsing events is possible without an account, creating an account is required to join or organize events.",
    id: 6,
  },
  {
    question: "How do I donate to support a clean-up event?",
    answer:
      "You can support clean-up efforts by donating through the app or website’s donation feature.",
    id: 7,
  },
  {
    question: "What safety guidelines should I follow during an event?",
    answer:
      "Follow the organizer’s instructions, wear appropriate gear, and avoid handling hazardous materials without proper training.",
    id: 8,
  },
  {
    question: "What should I expect during a typical clean-up event?",
    answer:
      "Expect to work collaboratively with others, picking up trash or debris, and contributing to a cleaner environment.",
    id: 9,
  },
  {
    question:
      "Who can I contact for help if I encounter an issue with the app?",
    answer:
      "For app issues, you can contact our support team via the 'Help' section in the app or on the website.",
    id: 10,
  },
  {
    question: "Is CleanupHub free to use?",
    answer:
      "Yes, CleanupHub is free to use for browsing events and joining as a participant. Organizers may incur costs for promoting events or accessing premium features.",
    id: 11,
  },
  {
    question:
      "How can I promote my clean-up event to attract more participants?",
    answer:
      "You can use CleanupHub’s sharing options to promote your event on social media and reach more participants through featured listings. You can also collaborate with local organizations, and lastly you can promote your event through CleanupHub’s promote function.",
    id: 12,
  },
  {
    question: "What happens if a clean-up event gets canceled?",
    answer:
      "Event organizers will notify participants of any cancellations through the app or website. Keep an eye on your notifications.",
    id: 13,
  },
  {
    question: "Can I track my impact through CleanupHub?",
    answer:
      "Yes, CleanupHub provides tools to track your rating and attendance at events.",
    id: 14,
  },
  {
    question: "What types of clean-up events can I find on CleanupHub?",
    answer:
      "CleanupHub features various events, including cleaning, volunteering, tree planting, and more.",
    id: 15,
  },
  {
    question: "Can businesses or organizations use CleanupHub?",
    answer:
      "Absolutely! Businesses and organizations can create accounts to organize clean-up events, sponsor efforts, or collaborate with the community.",
    id: 16,
  },
  {
    question: "Can I collaborate with others to organize a clean-up event?",
    answer:
      "Not for now, but we are working on a feature that will allow you to collaborate with others to organize a clean-up event.",
    id: 17,
  },
  {
    question: "What should I do if I find hazardous waste during a clean-up?",
    answer:
      "Do not handle hazardous materials unless you have proper training. Report them to the event organizer or local authorities immediately.",
    id: 18,
  },
  {
    question: "Does CleanupHub offer rewards or recognition for participants?",
    answer:
      "Yes, active participants can earn badges and recognition for their contributions to environmental efforts.",
    id: 19,
  },
];

const Faq = () => {
  return (
    <PageLayout>
      <div className="flex w-full flex-col items-center justify-center gap-y-32">
        <MaxWidthWrapper>
          <div className="my-16">
            <h2 className="mb-14 text-center text-4xl font-bold">
              Most Popular Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                  <AccordionTrigger className="text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </MaxWidthWrapper>
      </div>
    </PageLayout>
  );
};

export default Faq;
