// Local development server. Vercel uses api/inquiry.js in production.
import { createServer } from "node:http";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(ROOT, "data");
const UPLOAD_DIR = resolve(DATA_DIR, "uploads");
const MAX_BODY_SIZE = 3 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const requestsByAddress = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const serviceOptions = new Set([
  "ERP Development",
  "Website Development",
  "Custom Software Development",
  "Artificial Intelligence",
  "Dashboard and Analytics",
  "System Integration",
  "Other"
]);

const attachmentTypes = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
};

const cleanText = (value, maxLength = 2500) =>
  typeof value === "string" ? value.replaceAll("\0", "").trim().slice(0, maxLength) : "";

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export const validateInquiry = (body) => {
  const record = {
    name: cleanText(body.name, 100),
    company: cleanText(body.company, 120),
    email: cleanText(body.email, 180).toLowerCase(),
    whatsapp: cleanText(body.whatsapp, 30),
    service: cleanText(body.service, 80),
    businessType: cleanText(body.businessType, 80),
    budget: cleanText(body.budget, 80),
    timeline: cleanText(body.timeline, 80),
    brief: cleanText(body.brief, 2500),
    consent: body.consent === true,
    website: cleanText(body.website, 200)
  };

  const errors = {};
  if (record.name.length < 2) errors.name = "Please provide your name.";
  if (record.company.length < 2) errors.company = "Please provide your company name.";
  if (!validEmail(record.email)) errors.email = "Please provide a valid email address.";
  if (record.whatsapp && !/^[+0-9()\-\s]{7,24}$/.test(record.whatsapp)) errors.whatsapp = "Please provide a valid WhatsApp number.";
  if (!serviceOptions.has(record.service)) errors.service = "Please choose a valid service.";
  if (record.brief.length < 20) errors.brief = "Please provide at least 20 characters of project context.";
  if (!record.consent) errors.consent = "Consent is required before the inquiry can be processed.";

  return { valid: Object.keys(errors).length === 0, errors, record };
};

const withinRateLimit = (address) => {
  const now = Date.now();
  const recent = (requestsByAddress.get(address) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestsByAddress.set(address, recent);
    return false;
  }
  recent.push(now);
  requestsByAddress.set(address, recent);
  return true;
};

const readJsonBody = async (request) => {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
};

const prepareAttachment = async (attachment, inquiryId) => {
  if (!attachment) return { metadata: null, emailAttachment: null };
  const originalName = cleanText(attachment.name, 160);
  const extension = originalName.split(".").pop()?.toLowerCase();
  if (!extension || !attachmentTypes[extension]) throw new Error("INVALID_ATTACHMENT");
  if (attachment.type && attachment.type !== "application/octet-stream" && attachment.type !== attachmentTypes[extension]) {
    throw new Error("INVALID_ATTACHMENT");
  }
  if (typeof attachment.data !== "string") throw new Error("INVALID_ATTACHMENT");
  const buffer = Buffer.from(attachment.data, "base64");
  if (!buffer.length || buffer.length > MAX_ATTACHMENT_SIZE) throw new Error("INVALID_ATTACHMENT");
  if (Number(attachment.size) && Math.abs(Number(attachment.size) - buffer.length) > 4) throw new Error("INVALID_ATTACHMENT");

  const safeBaseName = originalName
    .slice(0, -(extension.length + 1))
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "attachment";
  const storedName = `${inquiryId}-${safeBaseName}.${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(resolve(UPLOAD_DIR, storedName), buffer, { flag: "wx" });

  return {
    metadata: {
      originalName,
      storedName,
      type: attachmentTypes[extension],
      size: buffer.length
    },
    emailAttachment: {
      filename: originalName,
      content: buffer.toString("base64")
    }
  };
};

const inquiryId = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `INQ-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
};

const formatInquiryEmail = (record) => [
  `New website inquiry: ${record.id}`,
  "",
  `Name: ${record.name}`,
  `Company: ${record.company}`,
  `Email: ${record.email}`,
  `WhatsApp: ${record.whatsapp || "Not provided"}`,
  `Service: ${record.service}`,
  `Business type: ${record.businessType || "Not provided"}`,
  `Budget: ${record.budget || "Not provided"}`,
  `Timeline: ${record.timeline || "Not provided"}`,
  "",
  "Project context:",
  record.brief,
  "",
  `Submitted: ${record.submittedAt}`
].join("\n");

const sendEmailNotifications = async (record, emailAttachment) => {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL;
  if (!apiKey || !toEmail || typeof fetch !== "function") {
    return { notificationDelivered: false, confirmationDelivered: false, configured: false };
  }

  const fromEmail = process.env.INQUIRY_FROM_EMAIL || "Nexora Website <onboarding@resend.dev>";
  const send = async (payload) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
  };

  const adminPayload = {
    from: fromEmail,
    to: [toEmail],
    reply_to: record.email,
    subject: `[${record.id}] ${record.service} inquiry from ${record.company}`,
    text: formatInquiryEmail(record)
  };
  if (emailAttachment) adminPayload.attachments = [emailAttachment];

  const confirmationPayload = {
    from: fromEmail,
    to: [record.email],
    subject: `We received your project inquiry (${record.id})`,
    text: [
      `Hello ${record.name},`,
      "",
      "Thank you for sharing your project context. Your inquiry has been received and will be reviewed before we recommend the right next step.",
      "",
      `Reference: ${record.id}`,
      `Service: ${record.service}`,
      "",
      "Nexora Digital"
    ].join("\n")
  };

  const [adminResult, confirmationResult] = await Promise.allSettled([send(adminPayload), send(confirmationPayload)]);
  return {
    notificationDelivered: adminResult.status === "fulfilled",
    confirmationDelivered: confirmationResult.status === "fulfilled",
    configured: true
  };
};

const handleInquiry = async (request, response) => {
  const address = request.socket.remoteAddress || "unknown";
  if (!withinRateLimit(address)) {
    sendJson(response, 429, { message: "Too many inquiries were sent from this connection. Please try again later." });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const { valid, errors, record } = validateInquiry(body);

    if (record.website) {
      sendJson(response, 201, { id: inquiryId(), stored: true });
      return;
    }

    if (!valid) {
      sendJson(response, 422, { message: "Please review the highlighted inquiry details.", errors });
      return;
    }

    const id = inquiryId();
    const attachment = await prepareAttachment(body.attachment, id);
    const savedRecord = {
      id,
      submittedAt: new Date().toISOString(),
      ...record,
      website: undefined,
      attachment: attachment.metadata
    };

    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(resolve(DATA_DIR, "inquiries.ndjson"), `${JSON.stringify(savedRecord)}\n`, "utf8");
    const email = await sendEmailNotifications(savedRecord, attachment.emailAttachment);

    sendJson(response, 201, {
      id,
      stored: true,
      notificationDelivered: email.notificationDelivered,
      confirmationDelivered: email.confirmationDelivered
    });
  } catch (error) {
    if (error.message === "PAYLOAD_TOO_LARGE") {
      sendJson(response, 413, { message: "The inquiry or attachment is too large." });
      return;
    }
    if (error.message === "INVALID_ATTACHMENT") {
      sendJson(response, 422, { message: "The attachment must be a valid PDF, DOC, or DOCX file no larger than 2 MB." });
      return;
    }
    if (error instanceof SyntaxError) {
      sendJson(response, 400, { message: "The inquiry request was not valid JSON." });
      return;
    }
    console.error("Inquiry processing failed:", error);
    sendJson(response, 500, { message: "The inquiry could not be saved. Please try again or contact us by email." });
  }
};

const serveStatic = async (request, response, pathname) => {
  let requestedPath = pathname === "/" ? "/index.html" : pathname;
  if (!extname(requestedPath) && !requestedPath.endsWith("/")) requestedPath = `${requestedPath}.html`;
  const extension = extname(requestedPath).toLowerCase();
  if (!mimeTypes[extension]) {
    sendJson(response, 404, { message: "Not found." });
    return;
  }

  const filePath = resolve(ROOT, `.${requestedPath}`);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${sep}`)) {
    sendJson(response, 403, { message: "Forbidden." });
    return;
  }

  try {
    const file = await readFile(filePath);
    const isAsset = requestedPath.startsWith("/assets/");
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": mimeTypes[extension],
      "Cache-Control": isAsset ? "public, max-age=31536000, immutable" : "no-cache"
    });
    if (request.method === "HEAD") response.end();
    else response.end(file);
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Static file error:", error);
    sendJson(response, 404, { message: "Not found." });
  }
};

export const app = createServer(async (request, response) => {
  const host = request.headers.host || "localhost";
  const url = new URL(request.url || "/", `http://${host}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    sendJson(response, 400, { message: "Invalid URL." });
    return;
  }

  if (request.method === "POST" && pathname === "/api/inquiry") {
    await handleInquiry(request, response);
    return;
  }

  if ((request.method === "GET" || request.method === "HEAD") && pathname !== "/api/inquiry") {
    await serveStatic(request, response, pathname);
    return;
  }

  sendJson(response, 405, { message: "Method not allowed." });
});

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || "0.0.0.0";
  app.listen(port, host, () => {
    console.log(`Nexora website running at http://${host}:${port}`);
  });
}
