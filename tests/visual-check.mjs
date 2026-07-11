import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const bundledPlaywright = join(
  process.env.USERPROFILE || "",
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "node",
  "node_modules",
  ".pnpm",
  "playwright@1.61.1",
  "node_modules",
  "playwright",
  "index.mjs"
);
const playwrightModule = existsSync(bundledPlaywright) ? pathToFileURL(bundledPlaywright).href : "playwright";
const { chromium } = await import(playwrightModule);
const installedBrowsers = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];
const executablePath = installedBrowsers.find(existsSync);
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const output = join(process.cwd(), "artifacts");
await mkdir(output, { recursive: true });

const issues = [];
const attachDiagnostics = (page, label) => {
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") issues.push(`${label} console ${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => issues.push(`${label} page error: ${error.message}`));
};

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
attachDiagnostics(desktop, "desktop");
await desktop.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await desktop.waitForTimeout(850);
await desktop.screenshot({ path: join(output, "desktop-first-view.png"), fullPage: false });

const desktopLayout = await desktop.evaluate(() => ({
  title: document.title,
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  missingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
  duplicateIds: [...document.querySelectorAll("[id]")]
    .map((element) => element.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index),
  heroBottom: document.querySelector(".hero").getBoundingClientRect().bottom,
  viewportHeight: window.innerHeight
}));

await desktop.click('[data-solution="automate"]');
await desktop.waitForTimeout(250);
if (!(await desktop.locator("[data-solution-title]").textContent()).includes("Automate")) issues.push("Solution explorer did not update.");
await desktop.click('[data-open-case="erp"]');
if (!(await desktop.locator("#case-dialog").evaluate((dialog) => dialog.open))) issues.push("Case study dialog did not open.");
await desktop.screenshot({ path: join(output, "desktop-case-dialog.png"), fullPage: false });
await desktop.click("[data-close-case]");
await desktop.click('[data-process="4"]');
await desktop.waitForTimeout(220);
if (!(await desktop.locator("[data-process-title]").textContent()).includes("Build")) issues.push("Process explorer did not update.");
for (const section of ["services", "solutions", "work", "industries", "process", "about", "faq", "contact"]) {
  await desktop.locator(`#${section}`).scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(760);
}
await desktop.locator(".solution-facts").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(760);
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(300);
const hiddenReveals = await desktop.evaluate(() =>
  [...document.querySelectorAll("[data-reveal]")]
    .filter((element) => !element.classList.contains("is-visible"))
    .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
);
if (hiddenReveals.length) issues.push(`Reveal elements did not activate: ${hiddenReveals.join(", ")}`);
await desktop.screenshot({ path: join(output, "desktop-full-page.png"), fullPage: true });
await desktop.locator("#contact").scrollIntoViewIfNeeded();
await desktop.waitForTimeout(800);
await desktop.screenshot({ path: join(output, "desktop-contact.png"), fullPage: false });
if (await desktop.locator(".floating-contact").isVisible()) issues.push("Floating contact action remained visible over the inquiry section.");
await desktop.fill('[name="name"]', "Visual Test");
await desktop.fill('[name="company"]', "Example Company");
await desktop.fill('[name="email"]', "visual@example.com");
await desktop.selectOption('[name="service"]', { label: "ERP Development" });
await desktop.click("[data-form-next]");
if (!(await desktop.locator('[data-form-step="2"]').isVisible())) issues.push("Inquiry form did not advance to step two.");
if (await desktop.locator("[data-form-success]").isVisible()) issues.push("Inquiry success panel was visible before submission.");
await desktop.waitForTimeout(450);
await desktop.screenshot({ path: join(output, "desktop-contact-step-two.png"), fullPage: false });

const responsiveLayouts = {};
for (const viewport of [
  { name: "wide", width: 1920, height: 1080 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 }
]) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  attachDiagnostics(page, viewport.name);
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(850);
  const firstView = await page.evaluate(() => {
    const shell = document.querySelector(".header-inner").getBoundingClientRect();
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      shellWidth: Math.round(shell.width),
      shellLeft: Math.round(shell.left),
      desktopNavVisible: getComputedStyle(document.querySelector(".desktop-nav")).display !== "none"
    };
  });
  await page.screenshot({ path: join(output, `${viewport.name}-first-view.png`), fullPage: false });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.querySelector("#contact").offsetTop);
  });
  await page.waitForTimeout(850);
  const contactView = await page.evaluate(() => {
    const contact = document.querySelector("#contact");
    const grid = document.querySelector(".contact-grid");
    const panel = document.querySelector(".inquiry-panel").getBoundingClientRect();
    return {
      contactHeight: Math.round(contact.getBoundingClientRect().height),
      viewportHeight: window.innerHeight,
      gridColumns: getComputedStyle(grid).gridTemplateColumns,
      panelWidth: Math.round(panel.width),
      panelLeft: Math.round(panel.left),
      panelRight: Math.round(panel.right)
    };
  });
  await page.screenshot({ path: join(output, `${viewport.name}-contact.png`), fullPage: false });
  responsiveLayouts[viewport.name] = { ...firstView, ...contactView };
  if (firstView.scrollWidth > firstView.clientWidth) issues.push(`${viewport.name} horizontal overflow: ${firstView.scrollWidth}/${firstView.clientWidth}`);
  if (viewport.width >= 1000 && firstView.shellWidth / firstView.clientWidth < 0.9) issues.push(`${viewport.name} shell is still too narrow: ${firstView.shellWidth}/${firstView.clientWidth}`);
  if (viewport.width >= 1000 && contactView.contactHeight < viewport.height - 80) issues.push(`${viewport.name} contact section does not fill the laptop viewport.`);
  if (viewport.width <= 900 && contactView.gridColumns.split(" ").length > 1) issues.push(`${viewport.name} contact layout did not stack.`);
  await page.close();
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
attachDiagnostics(mobile, "mobile");
await mobile.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(850);
await mobile.screenshot({ path: join(output, "mobile-first-view.png"), fullPage: false });
const mobileInitialLayout = await mobile.evaluate(() => ({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  heroBottom: document.querySelector(".hero").getBoundingClientRect().bottom,
  viewportHeight: window.innerHeight,
  headerHeight: document.querySelector(".site-header").getBoundingClientRect().height
}));
await mobile.click("[data-menu-toggle]");
if ((await mobile.getAttribute("[data-menu-toggle]", "aria-expanded")) !== "true") issues.push("Mobile menu did not open.");
await mobile.screenshot({ path: join(output, "mobile-menu.png"), fullPage: false });
await mobile.click('[data-mobile-menu] a[href="#services"]');
await mobile.waitForTimeout(250);
if ((await mobile.getAttribute("[data-menu-toggle]", "aria-expanded")) !== "false") issues.push("Mobile menu did not close after navigation.");

await mobile.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, document.querySelector("#contact").offsetTop);
});
await mobile.waitForTimeout(800);
if (await mobile.locator(".floating-contact").isVisible()) issues.push("Mobile floating contact action remained visible over the inquiry section.");
if (await mobile.locator("[data-back-top]").isVisible()) issues.push("Mobile back-to-top action remained visible over the inquiry section.");
await mobile.screenshot({ path: join(output, "mobile-contact.png"), fullPage: false });
await browser.close();

if (desktopLayout.scrollWidth > desktopLayout.clientWidth) issues.push(`Desktop horizontal overflow: ${desktopLayout.scrollWidth}/${desktopLayout.clientWidth}`);
if (mobileInitialLayout.scrollWidth > mobileInitialLayout.clientWidth) issues.push(`Mobile horizontal overflow: ${mobileInitialLayout.scrollWidth}/${mobileInitialLayout.clientWidth}`);
if (desktopLayout.missingAlt) issues.push(`Images missing alt text: ${desktopLayout.missingAlt}`);
if (desktopLayout.duplicateIds.length) issues.push(`Duplicate IDs: ${desktopLayout.duplicateIds.join(", ")}`);

console.log(JSON.stringify({ desktopLayout, responsiveLayouts, mobileLayout: mobileInitialLayout, issues }, null, 2));
if (issues.length) process.exitCode = 1;
