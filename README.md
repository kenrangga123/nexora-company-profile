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

The Vercel inquiry function validates requests and attachments, rate-limits repeated submissions on warm instances, sends the admin notification first, and sends the customer confirmation as a best-effort follow-up. Unlike the local development server, it does not write inquiry data to the deployment filesystem.

## Inquiry workflow

The form validates in the browser and again on the server. Accepted inquiries are stored outside the public file allowlist in `data/inquiries.ndjson`. Uploaded PDF, DOC, and DOCX files are limited to 2 MB and stored in `data/uploads/`.

Email delivery is optional. Copy `.env.example` values into your deployment environment and configure:

- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL`
- `INQUIRY_FROM_EMAIL`

When configured, the server sends the inquiry to the company inbox and a confirmation to the customer. Without email credentials, the inquiry is still stored locally and the API reports that email was not delivered.

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
- Portfolio scenarios and company claims
- Privacy and terms text

Update the matching values in `index.html`, `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, and `site.webmanifest`. Add approved client logos and verified testimonials only after permission is confirmed.

## Search and performance

The site includes semantic headings, metadata, Open Graph data, Organization and FAQ structured data, `robots.txt`, `sitemap.xml`, a web manifest, descriptive image alternatives, responsive layouts, lazy-loaded case-study media, and optimized WebP assets.

Original image-generation prompts and asset paths are documented in `ASSET_NOTES.md`.
