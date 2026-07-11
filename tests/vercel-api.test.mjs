import assert from "node:assert/strict";
import test from "node:test";
import inquiry from "../api/inquiry.js";

const validInquiry = {
  name: "Ari Wijaya",
  company: "Example Manufacturing",
  email: "ari@example.com",
  whatsapp: "+62 812 3456 7890",
  service: "ERP Development",
  businessType: "Manufacturing",
  budget: "Need guidance",
  timeline: "Within 3 months",
  brief: "We need to connect purchasing, production, inventory, and finance workflows.",
  consent: true,
  website: ""
};

const request = (body, method = "POST") =>
  new Request("https://nexora.example/api/inquiry", {
    method,
    headers: { "Content-Type": "application/json", Origin: "https://nexora.example" },
    body: method === "POST" ? JSON.stringify(body) : undefined
  });

test("Vercel inquiry function rejects unsupported methods", async () => {
  const response = await inquiry.fetch(request(null, "GET"));
  assert.equal(response.status, 405);
});

test("Vercel inquiry function validates input", async () => {
  const response = await inquiry.fetch(request({ ...validInquiry, email: "invalid" }));
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.ok(result.errors.email);
});

test("Vercel inquiry function reports missing email configuration", async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousEmail = process.env.INQUIRY_TO_EMAIL;
  delete process.env.RESEND_API_KEY;
  delete process.env.INQUIRY_TO_EMAIL;
  const response = await inquiry.fetch(request(validInquiry));
  assert.equal(response.status, 503);
  if (previousKey) process.env.RESEND_API_KEY = previousKey;
  if (previousEmail) process.env.INQUIRY_TO_EMAIL = previousEmail;
});
