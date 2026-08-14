import assert from "node:assert/strict";
import test from "node:test";

import { EXPORT_PNG_OPTIONS, prepareExportNode } from "../src/export-image.js";

test("export options do not cache-bust local blob URLs", () => {
  assert.deepEqual(EXPORT_PNG_OPTIONS, { pixelRatio: 2 });
  assert.equal("cacheBust" in EXPORT_PNG_OPTIONS, false);
});

test("rejects when the export canvas is not mounted", async () => {
  await assert.rejects(prepareExportNode(undefined), /导出画布尚未准备完成/);
});

test("rejects when an image in the export canvas failed to load", async () => {
  const failedImage = {
    complete: true,
    naturalWidth: 0,
    currentSrc: "blob:failed-photo",
  };
  const node = { querySelectorAll: () => [failedImage] };

  await assert.rejects(prepareExportNode(node), /blob:failed-photo/);
});
