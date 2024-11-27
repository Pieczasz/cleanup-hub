/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use server";

// Components
import { EmailTemplate } from "@/components/ui/email-template";
import { EmailTemplateSupport } from "@/components/ui/email-template-support";

// Functions
import { Resend } from "resend";

// Zod
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(2),
});

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const resend = new Resend(apiKey);

export const send = async (emailFormData: z.infer<typeof formSchema>) => {
  const parsedData = formSchema.parse(emailFormData);
  try {
    const responseToUser = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [parsedData.email],
      subject: "Welcome! We have received your message",
      react: EmailTemplate({ firstName: parsedData.firstName }),
    });

    if (!responseToUser) {
      throw new Error("Failed to send email to user");
    }

    const responseToSupport = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ["bartekp854@gmail.com"],
      subject: "New Support Ticket",
      react: EmailTemplateSupport(parsedData),
    });

    if (!responseToSupport) {
      throw new Error("Failed to send email to support");
    }
  } catch (e) {
    throw e;
  }
};
