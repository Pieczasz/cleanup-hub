"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoadingSpinner() {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
  );
}

function PaymentSuccessContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [sessionData, setSessionData] = useState<{
    amount_total?: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/checkout_sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            errorData.error ?? `HTTP error! status: ${res.status}`,
          );
        }
        return res.json() as Promise<{ amount_total?: number }>;
      })
      .then((data) => {
        if (!data?.amount_total) {
          throw new Error("Invalid session data received");
        }
        setSessionData(data);
        setStatus("success");
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
        setStatus("error");
      });
  }, [sessionId]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "error") {
    return (
      <div className="text-white">
        <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
        <p>Unable to load payment details. Please contact support.</p>
      </div>
    );
  }

  const amount = sessionData?.amount_total
    ? (sessionData.amount_total / 100).toFixed(2)
    : "0.00";

  return (
    <div className="rounded-md p-10">
      <h1 className="mb-2 text-4xl font-extrabold">Thank you!</h1>
      <h2 className="text-2xl">Your donation was successful</h2>
      <div className="mt-5 rounded-md bg-white p-2 text-4xl font-bold text-[#6AA553]">
        ${amount}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <main className="flex h-screen items-center justify-center bg-[#6AA553] text-center text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
