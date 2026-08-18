import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ENGLISH_ONLY_FILES = [
  "AGENTS.md",
  "HANDOFF.md",
  "README.md",
  "src/App.jsx",
  "src/export-image.js",
  "src/main.jsx",
  "src/styles.css",
];

test("product copy and project guidance contain no Chinese characters", async () => {
  const contents = await Promise.all(ENGLISH_ONLY_FILES.map((file) => readFile(file, "utf8")));
  const filesWithChinese = ENGLISH_ONLY_FILES.filter((_, index) => /\p{Script=Han}/u.test(contents[index]));

  assert.deepEqual(filesWithChinese, []);
});
