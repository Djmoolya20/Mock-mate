import { chromium } from "playwright-core";
import fs from "node:fs";

const outDir = "shots";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

await desktop.addInitScript(() => {
  localStorage.setItem(
    "poise.user.v1",
    JSON.stringify({ name: "Mayuresh", email: "mayuresh@poise.demo" }),
  );
});

const page = await desktop.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

async function shot(path, name, options = {}) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${name}.png`, ...options });
}

await shot("/", "01-home");
await shot("/sign-in", "02-sign-in");
await shot("/setup", "03-setup");
await shot("/report/sample_2", "04-report", { fullPage: true });
await shot("/history", "05-history", { fullPage: true });

await page.goto("http://localhost:3000/setup", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /start interview/i }).click();
await page.waitForURL("**/interview", { timeout: 10000 });
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/06-interview.png` });

const answers = [
  "I started in graphic design before moving into product design, because I wanted to understand why a screen should exist, not only how it looks. At my last company I owned onboarding for a B2B tool. I ran six customer interviews, cut the setup flow from nine steps to four, and activation moved from 41% to 58% in one quarter. I am drawn to this role because it sits close to both craft and business impact.",
  "I would first segment the drop-off to see whether it is concentrated in one step or spread across the flow. Then I would review session replays, look at the funnel by cohort, and speak to five people who abandoned. My hypothesis would be either unclear value or too much effort before the first win. I would prototype a shorter path, test it with a small cohort, and use activation and time-to-value as the decision metrics.",
  "I once disagreed with an engineer who wanted to ship a technically elegant component that made the first-run experience harder to understand. Instead of debating in the abstract, I asked us to test both versions with five users. The simpler version won on comprehension, and we documented the trade-off so we could revisit it later.",
  "I would make the trade-off explicit. For this flow, the cost of a slow first render was higher than the cost of a little extra client state, so I kept the critical path light and deferred the secondary panel. I set a performance budget and used real-user data to decide when to revisit it.",
  "I want them to remember that I make the complex feel calm. I ask good questions, I bring engineering into the room early, and I care about the person on the other side of the screen. That is the thread through the work I am proudest of.",
];

for (let index = 0; index < answers.length; index += 1) {
  await page
    .getByPlaceholder(/Start with your first sentence/)
    .fill(answers[index]);
  await page.getByRole("button", { name: /send answer/i }).click();
  if (index < answers.length - 1) {
    await page.waitForTimeout(1800);
  }
}

await page.waitForURL("**/report/**", { timeout: 15000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outDir}/08-generated-report.png`, fullPage: true });
const generatedUrl = page.url();
await page.goto("http://localhost:3000/history", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/09-history-after.png`, fullPage: true });

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
const mobilePage = await mobile.newPage();
await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: `${outDir}/07-home-mobile.png`, fullPage: true });

console.log(JSON.stringify({ errors, generatedUrl }, null, 2));
await browser.close();
