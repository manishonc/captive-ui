import { NextRequest } from "next/server";

const CAPTIVE_HTML = (params: {
  baseGrantUrl: string;
  redirectUrl: string;
  clientMac: string;
  error?: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Free WiFi</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="width:350px;border-radius:8px;background:#fff;padding:30px;box-shadow:0 5px 20px rgba(0,0,0,0.1);">
    <h2 style="margin:0 0 16px;font-size:1.25rem;font-weight:600;color:#111;">Connect to Free WiFi</h2>
    ${params.error ? `<p style="margin:0 0 12px;font-size:14px;color:#b91c1c;">${params.error}</p>` : ""}
    <form method="POST" action="/api/grant" style="display:flex;flex-direction:column;gap:8px;">
      <input type="hidden" name="base_grant_url" value="${escapeHtml(params.baseGrantUrl)}" />
      <input type="hidden" name="redirect_url" value="${escapeHtml(params.redirectUrl)}" />
      <input type="hidden" name="client_mac" value="${escapeHtml(params.clientMac)}" />
      <input type="text" name="name" placeholder="Full Name" required style="width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:6px;padding:10px 12px;font-size:1rem;color:#111;" />
      <input type="email" name="email" placeholder="Email Address" required style="width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:6px;padding:10px 12px;font-size:1rem;color:#111;" />
      <label style="margin-top:12px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;color:#374151;">
        <input type="checkbox" name="terms" value="on" required style="width:16px;height:16px;accent-color:#5c0f8b;" />
        I agree to Terms &amp; Conditions
      </label>
      <button type="submit" style="margin-top:16px;width:100%;padding:12px 16px;border:none;border-radius:6px;background:#5c0f8b;color:#fff;font-size:1rem;cursor:pointer;">
        Connect
      </button>
    </form>
  </div>
</body>
</html>`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const baseGrantUrl = searchParams.get("base_grant_url") ?? "";
  const redirectUrl = searchParams.get("redirect_url") ?? "";
  const clientMac = searchParams.get("client_mac") ?? "";
  const error = searchParams.get("error") ?? undefined;

  const html = CAPTIVE_HTML({
    baseGrantUrl,
    redirectUrl,
    clientMac,
    error: error ? decodeURIComponent(error) : undefined,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
