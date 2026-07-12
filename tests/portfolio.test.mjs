import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { caseStudies } from "../content.js";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("portfolio contains the four working prototypes and expected gallery counts", async () => {
  assert.deepEqual(Object.keys(caseStudies), ["erp", "rag", "faceswap", "cctv"]);
  assert.deepEqual(
    Object.fromEntries(Object.entries(caseStudies).map(([key, project]) => [key, project.images.length])),
    { erp: 4, rag: 2, faceswap: 3, cctv: 1 }
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
