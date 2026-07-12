# Nexora Interactive Company Profile

A responsive company profile website for an ERP, custom software, AI, analytics, integration, and web-platform company. The project is dependency-free at runtime and includes a small Node server for static delivery and inquiry handling.

## Run locally

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:4173` on this laptop. To open the site from another device on the same Wi-Fi, use the laptop's current IPv4 address with port `4173`, for example `http://192.168.1.14:4173`.

The development server binds to `0.0.0.0` by default so it can accept local-network connections. This does not publish the site to the public internet.

## Temporary public access

Cloudflare Quick Tunnel can expose the running local server through a temporary public HTTPS URL:

```powershell
cloudflared tunnel --url http://127.0.0.1:4173 --no-autoupdate --protocol http2
```

The generated `trycloudflare.com` URL works from any internet connection while this laptop, the Node server, and the tunnel process remain running. Quick Tunnel URLs can change after restart and have no uptime guarantee; use a named tunnel or deployed hosting for a permanent production address.

## GitHub and Vercel deployment

This repository is ready for Vercel as a static site with a Node.js function at `api/inquiry.js`. Connect the GitHub repository to Vercel or deploy from the project root with:

```powershell
vercel link
vercel deploy --prod
```

Configure these Production, Preview, and Development environment variables in Vercel before using the inquiry form:

- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL`
- `INQUIRY_FROM_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDAR_TIME_ZONE=Asia/Jakarta`

`RESEND_API_KEY` and `INQUIRY_TO_EMAIL` are required. Google Calendar configuration is optional at runtime: an incomplete Calendar configuration does not reject an inquiry after the admin email has been delivered.

### Gmail and Google Calendar alerts

1. Create a Resend API key and set `INQUIRY_TO_EMAIL` to the Gmail inbox that should receive inquiry alerts.
2. Use a verified sending domain for `INQUIRY_FROM_EMAIL` when customer confirmation emails must reach addresses beyond the Resend account owner.
3. In Google Cloud, enable the Google Calendar API and create a service account with a JSON key.
4. In Google Calendar, create a dedicated calendar named `Nexora Inquiries`.
5. Share only that calendar with the service account email using the `Make changes to events` permission.
6. Put the service account email, private key, and dedicated calendar ID into the Vercel variables above. When entering the private key as one line, preserve line breaks as literal `\n` sequences.
7. Add each secret directly through Vercel or `.env.local`; never commit the JSON key or paste it into source files.

Each accepted inquiry sends the admin email first. It then sends the customer confirmation and creates a private 30-minute Calendar follow-up beginning one hour after submission. The Calendar event uses an email reminder 30 minutes before and a popup reminder 10 minutes before. Calendar or customer-confirmation failures are logged as best-effort failures and do not undo a delivered admin inquiry.

## Language

The current release is English-only. It does not load locale bundles or call an external translation service at build time or in the browser.

The Vercel inquiry function validates requests and attachments, rate-limits repeated submissions on warm instances, sends the admin notification first, and sends the customer confirmation as a best-effort follow-up. Unlike the local development server, it does not write inquiry data to the deployment filesystem.

## Inquiry workflow

The form validates in the browser and again on the server. Accepted inquiries are stored outside the public file allowlist in `data/inquiries.ndjson`. Uploaded PDF, DOC, and DOCX files are limited to 2 MB and stored in `data/uploads/`.

Copy `.env.example` values into your deployment environment and configure:

- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL`
- `INQUIRY_FROM_EMAIL`

When configured, the server sends the inquiry to the company inbox and a confirmation to the customer. Without email credentials, the inquiry is still stored locally and the API reports that email was not delivered.

The Vercel function requires admin email delivery before accepting an inquiry. Its success response also reports `confirmationDelivered`, `calendarConfigured`, and `calendarEventCreated`, allowing provider status to be inspected without exposing credentials.

## Checks

```powershell
npm.cmd test
node .\tests\visual-check.mjs
```

The visual check uses the bundled Codex Playwright runtime when available and falls back to an installed Chrome or Edge browser.

## Replace before launch

The user did not provide final company details, so the following are intentional placeholders:

- Brand: `Nexora Digital`
- Domain and canonical URL: `https://nexora.example`
- Email: `hello@nexora.example`
- Location: `Surabaya, Indonesia`
- Privacy and terms text

Update the matching values in `index.html`, `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, and `site.webmanifest`. Add approved client logos and verified testimonials only after permission is confirmed.

## Search and performance

The site includes semantic headings, metadata, Open Graph data, Organization and FAQ structured data, `robots.txt`, `sitemap.xml`, a web manifest, descriptive image alternatives, responsive layouts, lazy-loaded case-study media, and optimized WebP assets.

Original image-generation prompts and asset paths are documented in `ASSET_NOTES.md`.
