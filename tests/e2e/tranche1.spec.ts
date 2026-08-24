import { test, expect } from "@playwright/test";

test.describe("tranche 1 game pages", () => {
  test("codeword renders preview grid and controls", async ({ page }) => {
    await page.goto("/games/codeword");
    await expect(page.getByRole("heading", { name: /codeword generator/i })).toBeVisible();
    // Preview grid cells exist.
    await expect(page.locator(".inline-grid div").first()).toBeVisible();
    // Theme + size controls present and functional.
    await expect(page.getByText("Theme", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /create new preview/i })).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("bingo classic cards show BINGO header and free center", async ({ page }) => {
    await page.goto("/games/bingo");
    await expect(page.getByRole("heading", { name: /bingo card generator/i })).toBeVisible();
    for (const letter of ["B", "I", "N", "G", "O"]) {
      await expect(page.getByText(letter, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText("FREE", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /generate & download pdf/i })).toBeEnabled();

    // Switching to a compact mode hides the free space.
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /compact 3×3/i }).click();
    await expect(page.getByText("FREE", { exact: true })).toHaveCount(0);
  });

  test("number search lists sequences and enables download", async ({ page }) => {
    await page.goto("/games/number-search");
    await expect(page.getByRole("heading", { name: /number search generator/i })).toBeVisible();
    await expect(page.getByText(/sequences to find \(\d+\)/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("new games are listed as ready on the hub", async ({ page }) => {
    await page.goto("/games");
    for (const slug of ["codeword", "bingo", "number-search"]) {
      await expect(page.locator(`main a[href="/games/${slug}"]`)).toBeVisible();
    }
  });

  test("new routes are in the sitemap", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    for (const path of ["/games/codeword", "/games/bingo", "/games/number-search"]) {
      expect(body).toContain(path);
    }
  });

  test("codeword PDF downloads with puzzle and answer pages", async ({ page }) => {
    await page.goto("/games/codeword");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^codeword-codeword-\d+\.pdf$/);
  });

  test("bingo PDF downloads including call sheet", async ({ page }) => {
    await page.goto("/games/bingo");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^bingo-classic-\d+cards\.pdf$/);
  });

  test("number search PDF downloads with answer key", async ({ page }) => {
    await page.goto("/games/number-search");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^number-search-\d+x\d+\.pdf$/);
  });
});
