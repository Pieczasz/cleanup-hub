"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface StripeAccount {
  status: "connected" | "not_connected";
  details_submitted?: boolean;
  payouts_enabled?: boolean;
  charges_enabled?: boolean;
  account_type?: string;
  business_type?: string;
  email?: string;
}

export default function StripeSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<StripeAccount | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchAccountDetails();
    };
    init().catch((error) => console.error("Failed to initialize:", error));
  }, []);

  const fetchAccountDetails = async () => {
    try {
      const response = await fetch("/api/stripe/account");
      const data: StripeAccount = (await response.json()) as StripeAccount;
      setAccount(data);
    } catch (error) {
      console.error("Failed to fetch account details:", error);
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });
      const data: { url?: string } = (await response.json()) as {
        url?: string;
      };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create connect account:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Stripe Settings</h2>

      {account?.status === "connected" ? (
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Account Status</h3>
          <dl className="mt-2 space-y-2">
            <div className="flex justify-between">
              <dt>Status:</dt>
              <dd
                className={
                  account.details_submitted
                    ? "text-green-600"
                    : "text-yellow-600"
                }
              >
                {account.details_submitted ? "Complete" : "Incomplete"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Payouts:</dt>
              <dd
                className={
                  account.payouts_enabled ? "text-green-600" : "text-yellow-600"
                }
              >
                {account.payouts_enabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Email:</dt>
              <dd>{account.email}</dd>
            </div>
          </dl>
          {!account.details_submitted && (
            <Button
              onClick={handleConnectStripe}
              className="mt-4"
              variant="secondary"
            >
              Complete Account Setup
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            Connect your Stripe account to receive donations from your events
          </p>
          <Button onClick={handleConnectStripe} disabled={isLoading}>
            {isLoading ? "Loading..." : "Connect Stripe Account"}
          </Button>
        </>
      )}
    </div>
  );
}
