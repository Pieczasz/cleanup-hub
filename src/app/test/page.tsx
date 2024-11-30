import { auth } from "@/server/auth";
import React from "react";

const page = async () => {
  const session = await auth();

  return (
    <div>
      <h1>Test Page</h1>
      <p>Session: {session ? JSON.stringify(session) : "null"}</p>
    </div>
  );
};

export default page;
