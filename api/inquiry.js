import { randomUUID } from "node:crypto";
import { JWT } from "google-auth-library";

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const PROVIDER_TIMEOUT_MS = 5_000;
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const requestsByAddress = globalThis.__nexoraInquiryRateLimits || new Map();
globalThis.__nexoraInquiryRateLimits = requestsByAddress;

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

const cleanText = (value, maxLength = 2500) =>
  typeof value === "string" ? value.replaceAll("\0", "").trim().slice(0, maxLength) : "";

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const json = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });

const validateInquiry = (body) => {
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

const validAttachmentSignature = (buffer, extension) => {
  if (extension === "pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === "doc") return buffer.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1";
  if (extension === "docx") return buffer.subarray(0, 2).toString("ascii") === "PK";
  return false;
};

const prepareAttachment = (attachment) => {
  if (!attachment) return null;
  const filename = cleanText(attachment.name, 160);
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension || !attachmentTypes[extension] || typeof attachment.data !== "string") throw new Error("INVALID_ATTACHMENT");
  if (attachment.type && attachment.type !== "application/octet-stream" && attachment.type !== attachmentTypes[extension]) {
    throw new Error("INVALID_ATTACHMENT");
  }
  const buffer = Buffer.from(attachment.data, "base64");
  if (!buffer.length || buffer.length > MAX_ATTACHMENT_SIZE || !validAttachmentSignature(buffer, extension)) {
    throw new Error("INVALID_ATTACHMENT");
  }
  if (Number(attachment.size) && Math.abs(Number(attachment.size) - buffer.length) > 4) throw new Error("INVALID_ATTACHMENT");
  return { filename, content: buffer.toString("base64") };
};

const makeInquiryId = () => {
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

const sendEmail = async (payload, { fetchImpl = fetch, idempotencyKey } = {}) => {
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {})
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`EMAIL_PROVIDER_${response.status}`);
};

const getCalendarConfig = () => ({
  clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || "",
  privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replaceAll("\\n", "\n").trim() || "",
  calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || "",
  timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE?.trim() || "Asia/Jakarta"
});

const calendarIsConfigured = (config = getCalendarConfig()) =>
  Boolean(config.clientEmail && config.privateKey && config.calendarId);

const defaultGetAccessToken = async (config) => {
  const client = new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [CALENDAR_SCOPE]
  });
  const credentials = await client.getAccessToken();
  if (!credentials.token) throw new Error("CALENDAR_TOKEN_MISSING");
  return credentials.token;
};

export const buildCalendarEvent = (record) => {
  const start = new Date(new Date(record.submittedAt).getTime() + 60 * 60 * 1_000);
  const end = new Date(start.getTime() + 30 * 60 * 1_000);
  const timeZone = getCalendarConfig().timeZone;
  return {
    summary: `[New inquiry] ${record.company} - ${record.service}`,
    description: [
      `Inquiry: ${record.id}`,
      `Name: ${record.name}`,
      `Company: ${record.company}`,
      `Email: ${record.email}`,
      `WhatsApp: ${record.whatsapp || "Not provided"}`,
      `Service: ${record.service}`,
      `Timeline: ${record.timeline || "Not provided"}`,
      "",
      "Project context:",
      record.brief
    ].join("\n"),
    start: { dateTime: start.toISOString(), timeZone },
    end: { dateTime: end.toISOString(), timeZone },
    visibility: "private",
    transparency: "opaque",
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 30 },
        { method: "popup", minutes: 10 }
      ]
    },
    extendedProperties: { private: { inquiryId: record.id } }
  };
};

export const createCalendarFollowUp = async (
  record,
  { fetchImpl = fetch, getAccessToken = defaultGetAccessToken } = {}
) => {
  const config = getCalendarConfig();
  if (!calendarIsConfigured(config)) return { configured: false, created: false };
  const accessToken = await getAccessToken(config);
  const response = await fetchImpl(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildCalendarEvent(record)),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
    }
  );
  if (!response.ok) throw new Error(`CALENDAR_PROVIDER_${response.status}`);
  const event = await response.json().catch(() => ({}));
  return { configured: true, created: true, eventId: event.id || null };
};

export const handleInquiry = async (request, dependencies = {}) => {
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return json({ message: "Origin not allowed." }, 403);

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!withinRateLimit(address)) return json({ message: "Too many inquiries were sent. Please try again later." }, 429);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "The inquiry request was not valid JSON." }, 400);
  }

  const { valid, errors, record } = validateInquiry(body || {});
  if (record.website) return json({ id: makeInquiryId(), stored: true }, 201);
  if (!valid) return json({ message: "Please review the highlighted inquiry details.", errors }, 422);

  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_TO_EMAIL) {
    return json({ message: "Inquiry email delivery is not configured yet." }, 503);
  }

  let attachment;
  try {
    attachment = prepareAttachment(body.attachment);
  } catch {
    return json({ message: "The attachment must be a valid PDF, DOC, or DOCX file no larger than 2 MB." }, 422);
  }

  const savedRecord = {
    id: makeInquiryId(),
    submittedAt: new Date().toISOString(),
    ...record,
    website: undefined
  };
  const fromEmail = process.env.INQUIRY_FROM_EMAIL || "Nexora Website <onboarding@resend.dev>";
  const adminEmail = {
    from: fromEmail,
    to: [process.env.INQUIRY_TO_EMAIL],
    reply_to: savedRecord.email,
    subject: `[${savedRecord.id}] ${savedRecord.service} inquiry from ${savedRecord.company}`,
    text: formatInquiryEmail(savedRecord)
  };
  if (attachment) adminEmail.attachments = [attachment];
  const sendEmailImpl = dependencies.sendEmail || sendEmail;
  const createCalendarImpl = dependencies.createCalendarFollowUp || createCalendarFollowUp;

  try {
    await sendEmailImpl(adminEmail, { idempotencyKey: `${savedRecord.id}-admin` });
  } catch (error) {
    console.error("Admin inquiry email failed:", error.message);
    return json({ message: "The inquiry could not be delivered. Please contact us directly by email." }, 502);
  }

  const [confirmationResult, calendarResult] = await Promise.allSettled([
    sendEmailImpl({
      from: fromEmail,
      to: [savedRecord.email],
      subject: `We received your project inquiry (${savedRecord.id})`,
      text: [
        `Hello ${savedRecord.name},`,
        "",
        "Thank you for sharing your project context. Your inquiry has been received and will be reviewed before we recommend the right next step.",
        "",
        `Reference: ${savedRecord.id}`,
        `Service: ${savedRecord.service}`,
        "",
        "Nexora Digital"
      ].join("\n")
    }, { idempotencyKey: `${savedRecord.id}-confirmation` }),
    createCalendarImpl(savedRecord)
  ]);

  if (confirmationResult.status === "rejected") {
    console.error(`Customer confirmation failed for ${savedRecord.id}:`, confirmationResult.reason?.message || "UNKNOWN");
  }
  if (calendarResult.status === "rejected") {
    console.error(`Calendar follow-up failed for ${savedRecord.id}:`, calendarResult.reason?.message || "UNKNOWN");
  }

  const calendarConfigured = calendarResult.status === "fulfilled"
    ? calendarResult.value.configured
    : calendarIsConfigured();
  return json({
    id: savedRecord.id,
    stored: true,
    notificationDelivered: true,
    confirmationDelivered: confirmationResult.status === "fulfilled",
    calendarConfigured,
    calendarEventCreated: calendarResult.status === "fulfilled" && calendarResult.value.created
  }, 201);
};

export default {
  fetch: handleInquiry
};
