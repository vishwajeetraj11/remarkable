import { test, expect } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("games hub lists ready games", async ({ page }) => {
  await page.goto("/games");
  await expect(
    page.getByRole("heading", { name: /games/i }).first()
  ).toBeVisible();
  await expect(page.locator('main a[href^="/games/"]').first()).toBeVisible();
});

test("a game page renders its generator UI", async ({ page }) => {
  await page.goto("/games/sudoku");
  await expect(page.locator("main")).toBeVisible();
});

test("unknown route shows the 404 page", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
});

test("bundle generator on the hub downloads a mixed PDF", async ({ page }) => {
  await page.goto("/games");
  const btn = page.getByRole("button", { name: /generate & download puzzle bundle pdf/i });
  await btn.scrollIntoViewIfNeeded();
  const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });
  await btn.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("puzzle-bundle.pdf");
});
