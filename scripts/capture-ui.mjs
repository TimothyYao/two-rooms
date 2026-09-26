import { chromium, devices } from "playwright";
import path from "node:path";
import fs from "node:fs";

const outDir = "/opt/cursor/artifacts";
fs.mkdirSync(outDir, { recursive: true });

const timId = process.env.TIM_ID;
if (!timId) throw new Error("TIM_ID required");
const base = "http://localhost:3000";

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["iPhone 13"],
  recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
});
const page = await context.newPage();

await page.goto(base);
await page.evaluate(
  ({ id }) => {
    localStorage.setItem(
      "two-flocks-player",
      JSON.stringify({ playerId: id, name: "Tim" }),
    );
  },
  { id: timId },
);
await page.reload();
await page.waitForSelector("text=Your role", { timeout: 15000 });
await page.screenshot({
  path: path.join(outDir, "two-flocks-role.png"),
  fullPage: true,
});

await page.getByRole("button", { name: "Rules" }).click();
await page.waitForSelector("text=How to play");
await page.screenshot({
  path: path.join(outDir, "two-flocks-rules.png"),
  fullPage: true,
});

await page.getByRole("button", { name: "Host" }).click();
await page.waitForSelector("text=Deck census");
await page.screenshot({
  path: path.join(outDir, "two-flocks-host.png"),
  fullPage: true,
});

await page.getByRole("button", { name: "Play" }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Hide team" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Hide role" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Show team" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Show role" }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Host" }).click();
await page.waitForTimeout(1000);

const video = page.video();
await context.close();
await browser.close();
if (video) {
  const vidPath = await video.path();
  const dest = path.join(outDir, "two-flocks-demo.webm");
  fs.renameSync(vidPath, dest);
  console.log("video", dest);
}
console.log("screenshots written to", outDir);
