import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { caseStudies, processData, serviceData } from "../content.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("portfolio contains the four working prototypes and expected gallery counts", async () => {
  assert.deepEqual(Object.keys(caseStudies), ["erp", "rag", "faceswap", "cctv"]);
  assert.deepEqual(
    Object.fromEntries(Object.entries(caseStudies).map(([key, project]) => [key, project.images.length])),
    { erp: 3, rag: 2, faceswap: 3, cctv: 1 }
  );

  assert.deepEqual(caseStudies.erp.categories, ["business-systems"]);
  assert.deepEqual(caseStudies.rag.categories, ["generative-ai"]);
  assert.deepEqual(caseStudies.faceswap.categories, ["generative-ai", "computer-vision"]);
  assert.deepEqual(caseStudies.cctv.categories, ["computer-vision"]);

  for (const project of Object.values(caseStudies)) {
    assert.match(project.eyebrow, /^Working prototype/);
    for (const image of project.images) {
      assert.match(image.src, /^\/assets\/work\/.+\.webp$/);
      const asset = await readFile(join(projectRoot, image.src.slice(1)));
      assert.ok(asset.length > 10_000, `${image.src} should be a real optimized asset`);
    }
  }
});

test("density reduction keeps three service categories and four delivery phases", async () => {
  assert.deepEqual(Object.keys(serviceData), ["businessSystems", "customPlatforms", "appliedAi"]);
  assert.equal(processData.length, 4);
  assert.deepEqual(processData.map((phase) => phase.index), ["01", "02", "03", "04"]);

  const canonicalServices = new Set([
    "ERP Development",
    "Dashboard and Analytics",
    "System Integration",
    "Custom Software Development",
    "Website Development",
    "Artificial Intelligence"
  ]);
  for (const category of Object.values(serviceData)) {
    assert.ok(canonicalServices.has(category.service));
    category.offerings.forEach((offering) => assert.ok(canonicalServices.has(offering)));
  }

  const homepage = await readFile(join(projectRoot, "index.html"), "utf8");
  const order = ["services", "work", "solutions", "process", "industries", "about", "faq", "contact"]
    .map((id) => homepage.indexOf(`id="${id}"`));
  assert.ok(order.every((position) => position >= 0));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});
