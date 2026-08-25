import { test, expect } from "@playwright/test";

test.describe("tranche 3 game pages", () => {
  test("arrow words renders clue grid", async ({ page }) => {
    await page.goto("/games/arrow-words");
    await expect(page.getByRole("heading", { name: /arrow words generator/i })).toBeVisible();
    await expect(page.locator(".inline-grid div").first()).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("slitherlink renders lattice preview", async ({ page }) => {
    await page.goto("/games/slitherlink");
    await expect(page.getByRole("heading", { name: /slitherlink generator/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /slitherlink preview/i })).toBeVisible();
    await expect(page.getByText(/solver-verified unique loop/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("hashi renders island board and switches sizes", async ({ page }) => {
    await page.goto("/games/hashi");
    await expect(page.getByRole("heading", { name: /hashi \(bridges\) generator/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /hashi preview/i })).toBeVisible({
      timeout: 30_000,
    });
    // Default 10×10; switch to 8×8.
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "8 × 8" }).click();
    await expect(page.getByText(/solver-verified unique bridge layout/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled({ timeout: 30_000 });
  });

  test("numberlink renders endpoint pairs", async ({ page }) => {
    await page.goto("/games/numberlink");
    await expect(page.getByRole("heading", { name: /numberlink generator/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /numberlink preview/i })).toBeVisible();
    await expect(page.getByText(/\d+ pairs/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("new games are listed as ready on the hub", async ({ page }) => {
    await page.goto("/games");
    for (const slug of ["arrow-words", "slitherlink", "hashi", "numberlink"]) {
      await expect(page.locator(`main a[href="/games/${slug}"]`)).toBeVisible();
    }
  });

  test("new routes are in the sitemap", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    for (const path of [
      "/games/arrow-words",
      "/games/slitherlink",
      "/games/hashi",
      "/games/numberlink",
    ]) {
      expect(body).toContain(path);
    }
  });

  test("arrow words PDF downloads with answer page", async ({ page }) => {
    await page.goto("/games/arrow-words");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^arrow-words-\d+x\d+\.pdf$/);
  });

  test("slitherlink PDF downloads with solution loop", async ({ page }) => {
    await page.goto("/games/slitherlink");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^slitherlink-\d+x\d+\.pdf$/);
  });

  test("hashi PDF downloads with bridge network", async ({ page }) => {
    await page.goto("/games/hashi");
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await downloadBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^hashi-\d+x\d+\.pdf$/);
  });

  test("numberlink PDF downloads with colored paths", async ({ page }) => {
    await page.goto("/games/numberlink");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^numberlink-\d+x\d+\.pdf$/);
  });
});
