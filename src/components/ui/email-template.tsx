import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.6 }}>
    <h1 style={{ color: "#4CAF50" }}>Hello, {firstName}!</h1>
    <p>
      Thank you for reaching out to us. We have received your message and will
      get back to you as soon as possible.
    </p>
    <p>Best regards,</p>
    <p>The Cleanup Hub Team</p>
    <footer style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
      <p>Cleanup Hub</p>
      <p>123 Clean Street, Clean City, CL 12345</p>
      <p>Email: support@cleanuphub.live</p>
    </footer>
  </div>
);
