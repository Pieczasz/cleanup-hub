"use client";

// Functions
import { useEffect, useState } from "react";
import { getCsrfToken } from "next-auth/react";

// Components
import { CardWrapper } from "@/components/auth/CardWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";

const LoginForm = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  useEffect(() => {
    async function loadCsrfToken() {
      const csrf = await getCsrfToken();
      console.log("CSRF Token:", csrfToken);
      if (csrf) {
        setCsrfToken(csrf);
      }
    }
    loadCsrfToken().catch((error) => {
      console.error("Failed to load CSRF token:", error);
    });
  }, []);

  return (
    <>
      <CardWrapper
        headerLabel="Sign In"
        cardFooterHref="/signUp"
        cardFooterText="Don't have an account?"
        cardFooterHrefText="Sign Up"
        showSocial
      >
        <form
          className="space-y-6"
          method="post"
          action="/api/auth/callback/credentials"
        >
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <div>
            <div>
              <label htmlFor="email">E-Mail</label>
              <Input
                name="email"
                id="email"
                placeholder="youremail@example.com"
                type="text"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password">Password</label>
              <Input
                name="password"
                id="password"
                placeholder="********"
                type="password"
              />
            </div>
          </div>
          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardWrapper>
    </>
  );
};

export default LoginForm;
