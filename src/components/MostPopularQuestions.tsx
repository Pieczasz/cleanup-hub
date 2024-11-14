import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";

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
];

const MostPopularQuestions = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative flex items-center justify-center">
        <div className="absolute top-0 z-[-1] h-[110rem] w-[155%] rounded-t-full bg-[#DAFFD8]"></div>
      </div>
      <div className="w-full flex-col items-center justify-center">
        <MaxWidthWrapper>
          <div className="mt-28">
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
            <div className="mt-12 flex justify-center">
              <Button className="mb-16 max-w-[12rem] rounded-3xl py-6 text-lg text-white">
                More Questions?
              </Button>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </div>
  );
};

export default MostPopularQuestions;
