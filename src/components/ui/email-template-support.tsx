import * as React from "react";

interface EmailTemplateSupportProps {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export const EmailTemplateSupport: React.FC<
  Readonly<EmailTemplateSupportProps>
> = ({ firstName, lastName, email, message }) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
    <h1 style={{ color: "#4CAF50" }}>New Support Ticket</h1>
    <p>
      <strong>First Name:</strong> {firstName}
    </p>
    <p>
      <strong>Last Name:</strong> {lastName}
    </p>
    <p>
      <strong>Email:</strong> {email}
    </p>
    <p>
      <strong>Message:</strong> {message}
    </p>
    <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
      <p>Cleanup Hub</p>
      <p>123 Clean Street, Clean City, CL 12345</p>
      <p>Email: support@cleanuphub.com</p>
    </footer>
  </div>
);
