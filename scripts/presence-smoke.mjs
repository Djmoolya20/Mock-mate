import { chromium } from "playwright-core";
import fs from "node:fs";

/**
 * Presence smoke test.
 *
 * Runs the interview with a synthetic camera feed (no face in frame) to prove
 * that the local MediaPipe bundle loads, the tracker starts, the camera is
 * released, and a report still renders when no presence is measured.
 *
 * Usage: node scripts/presence-smoke.mjs  (dev server must be running)
 */

const outDir = "shots";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
  ],
});

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  permissions: ["camera"],
});

await desktop.addInitScript(() => {
  localStorage.setItem(
    "poise.user.v1",
    JSON.stringify({ name: "Mayuresh", email: "mayuresh@poise.demo" }),
  );
});

const page = await desktop.newPage();
const errors = [];
const failedRequests = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
page.on("requestfailed", (request) => {
  failedRequests.push(`${request.url()} — ${request.failure()?.errorText}`);
});

await page.goto("http://localhost:3000/setup", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /start interview/i }).click();
await page.waitForURL("**/interview", { timeout: 10000 });

// Camera permission is pre-granted, so the room should auto-start the preview.
try {
  await page.getByText(/reading the room/i).waitFor({ timeout: 45000 });
} catch (error) {
  await page.screenshot({ path: `${outDir}/_presence-failure.png` });
  console.error(
    JSON.stringify(
      {
        message: error.message,
        aside: await page.locator("aside").first().innerText(),
        errors,
        failedRequests,
      },
      null,
      2,
    ),
  );
  await browser.close();
  process.exit(1);
}
await page.waitForTimeout(6500);

const liveSignals = await page
  .locator("text=Live signals")
  .locator("xpath=../..")
  .innerText()
  .catch(() => "");

await page.screenshot({ path: `${outDir}/10-presence-live.png` });

const answers = [
  "I moved from graphic design into product design because I wanted to understand why a screen should exist. At my last company I owned onboarding for a B2B tool, ran six customer interviews, and cut setup from nine steps to four. Activation moved from 41% to 58% in one quarter.",
  "I would segment the drop-off, review session replays, and speak to five people who abandoned. My hypothesis would be unclear value or too much effort before the first win, so I would prototype a shorter path and test it with a small cohort.",
  "I once disagreed with an engineer about a technically elegant component that made first-run harder. We tested both versions with five users, the simpler one won on comprehension, and we documented the trade-off.",
  "I would make the trade-off explicit, keep the critical path light, and set a performance budget. I used real-user data to decide when to revisit it.",
  "I want them to remember that I make the complex feel calm. I ask good questions, bring engineering in early, and care about the person on the other side of the screen.",
];

for (let index = 0; index < answers.length; index += 1) {
  await page
    .getByPlaceholder(/Start with your first sentence/)
    .fill(answers[index]);
  await page.getByRole("button", { name: /send answer/i }).click();
  if (index < answers.length - 1) await page.waitForTimeout(1800);
}

await page.waitForURL("**/report/**", { timeout: 20000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${outDir}/11-presence-report.png`, fullPage: true });

console.log(
  JSON.stringify(
    {
      errors,
      failedRequests,
      liveSignals,
      reportUrl: page.url(),
    },
    null,
    2,
  ),
);
await browser.close();
