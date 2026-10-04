import { expect, test, type Page, type TestInfo } from "@playwright/test";

const FIXTURES = [
  "fixture-rainy-mountain",
  "fixture-tokyo-night",
  "fixture-tropical-beach",
  "fixture-family-roadtrip",
  "fixture-minimal-weekend",
  "fixture-hiking-adventure",
] as const;

for (const fixtureId of FIXTURES) {
  test(`${fixtureId} renders without runtime failures`, async ({ page }, testInfo) => {
    const failures = monitorPageFailures(page);
    await page.goto(`/fixtures/experience/${fixtureId}`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("experience-fixture")).toHaveAttribute(
      "data-fixture-id",
      fixtureId,
    );
    await expect(page.locator("main[data-experience-id]")).toBeVisible();
    await expectLoadedImages(page);
    await expectNoDocumentOverflow(page);
    await capture(page, testInfo, `${fixtureId}-desktop`);
    expect(failures).toEqual([]);
  });
}

test("mobile choreography replaces desktop-only layouts", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const failures = monitorPageFailures(page);
  await page.goto("/fixtures/experience/fixture-rainy-mountain", { waitUntil: "networkidle" });

  const scenes = page.locator("section[data-layout]");
  await expect(scenes).toHaveCount(2);
  await expect(scenes.first()).toHaveAttribute("data-layout", "minimal-gallery");
  await expectLoadedImages(page);
  await expectNoDocumentOverflow(page);
  await capture(page, testInfo, "fixture-rainy-mountain-mobile");
  expect(failures).toEqual([]);
});

test("reduced motion resolves every scene to its still fallback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fixtures/experience/fixture-tokyo-night", { waitUntil: "networkidle" });

  const scenes = page.locator('section[data-reduced-motion="true"]');
  await expect(scenes).toHaveCount(2);
  await expect(scenes.first()).toHaveAttribute("data-motion", "none");
});

test("experience navigation is keyboard reachable", async ({ page }) => {
  await page.goto("/fixtures/experience/fixture-family-roadtrip", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");

  const focused = page.locator("nav a:focus");
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute("href", /#fixture-family-roadtrip-/);
});

function monitorPageFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && response.status() >= 400) {
      failures.push(`image ${response.status()}: ${response.url()}`);
    }
  });
  return failures;
}

async function expectLoadedImages(page: Page): Promise<void> {
  const images = page.locator("main img:visible");
  await expect.poll(() => images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
  }
}

async function expectNoDocumentOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

async function capture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await page.screenshot({
    path: testInfo.outputPath(`${name}.jpeg`),
    type: "jpeg",
    quality: 72,
    fullPage: true,
    animations: "disabled",
  });
}
