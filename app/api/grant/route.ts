import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://webhook.site/6590fb2c-9009-4dd0-9b86-f04b1537ef34";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const terms = formData.get("terms");
  const baseGrantUrl = (formData.get("base_grant_url") as string | null)?.trim() ?? "";
  const redirectUrl = (formData.get("redirect_url") as string | null)?.trim() ?? "";
  const clientMac = (formData.get("client_mac") as string | null)?.trim() ?? "";

  if (!name || !email) {
    return redirectToPortalWithError(request, "Please fill in name and email.", {
      baseGrantUrl,
      redirectUrl,
      clientMac,
    });
  }

  if (!terms || terms !== "on") {
    return redirectToPortalWithError(
      request,
      "You must agree to Terms & Conditions.",
      { baseGrantUrl, redirectUrl, clientMac }
    );
  }

  if (!baseGrantUrl || !redirectUrl) {
    return NextResponse.json(
      { error: "Missing redirect parameters. You may be offline." },
      { status: 400 }
    );
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        client_mac: clientMac || null,
        login_time: new Date().toISOString(),
      }),
    });
  } catch {
    // Proceed with redirect even if webhook fails so user still gets access
  }

  const grantRedirectUrl =
    baseGrantUrl +
    (baseGrantUrl.includes("?") ? "&" : "?") +
    "continue_url=" +
    encodeURIComponent(redirectUrl);

  return NextResponse.redirect(grantRedirectUrl, 302);
}

function redirectToPortalWithError(
  request: NextRequest,
  message: string,
  params: { baseGrantUrl: string; redirectUrl: string; clientMac: string }
): NextResponse {
  const url = new URL("/", request.nextUrl.origin);
  url.searchParams.set("error", encodeURIComponent(message));
  if (params.baseGrantUrl) url.searchParams.set("base_grant_url", params.baseGrantUrl);
  if (params.redirectUrl) url.searchParams.set("redirect_url", params.redirectUrl);
  if (params.clientMac) url.searchParams.set("client_mac", params.clientMac);
  return NextResponse.redirect(url.toString(), 302);
}
