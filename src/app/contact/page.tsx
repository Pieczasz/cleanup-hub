"use client";

import React from "react";
import PageLayout from "@/components/PageLayout";
import ContactForm from "@/components/ContactForm";

const Contact = () => {
  return (
    <PageLayout>
      <div className="flex w-full flex-col items-center justify-center gap-y-32">
        <ContactForm />
      </div>
    </PageLayout>
  );
};

export default Contact;
