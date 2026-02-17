"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const baseGrantUrl = searchParams.get("base_grant_url");
  const redirectUrl = searchParams.get("redirect_url");
  const clientMac = searchParams.get("client_mac");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConnect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    if (!name?.trim() || !email?.trim()) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch("https://webhook.site/6590fb2c-9009-4dd0-9b86-f04b1537ef34", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          client_mac: clientMac,
          login_time: new Date().toISOString(),
        }),
      });
    } finally {
      setIsSubmitting(false);
    }

    if (baseGrantUrl && redirectUrl) {
      window.location.href =
        baseGrantUrl + "&continue_url=" + encodeURIComponent(redirectUrl);
    } else {
      alert("Missing redirect parameters. You may be offline.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] font-sans">
      <div className="w-[350px] rounded-lg bg-white p-[30px] shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Connect to Free WiFi
        </h2>

        <form onSubmit={handleConnect} className="space-y-2">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full rounded border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-[#5c0f8b] focus:outline-none focus:ring-1 focus:ring-[#5c0f8b]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full rounded border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-[#5c0f8b] focus:outline-none focus:ring-1 focus:ring-[#5c0f8b]"
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#5c0f8b] focus:ring-[#5c0f8b]"
            />
            <span className="text-sm text-gray-700">
              I agree to Terms & Conditions
            </span>
          </label>

          <button
            type="submit"
            disabled={!termsAccepted || isSubmitting}
            className="mt-4 w-full cursor-pointer rounded-md border-none bg-[#5c0f8b] px-4 py-3 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Connecting…" : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5c0f8b] border-t-transparent" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
