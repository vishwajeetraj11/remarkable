import { test, expect } from "@playwright/test";

test.describe("tranche 2 game pages", () => {
  test("killer sudoku renders cage preview via worker", async ({ page }) => {
    await page.goto("/games/killer-sudoku");
    await expect(
      page.getByRole("heading", { name: /killer sudoku generator/i })
    ).toBeVisible();
    // Worker-generated preview eventually shows cages + sums.
    await expect(page.getByRole("img", { name: /killer sudoku preview/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/\d+ cages/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled({ timeout: 30_000 });
  });

  test("binairo renders grid and switches board sizes", async ({ page }) => {
    await page.goto("/games/binairo");
    await expect(page.getByRole("heading", { name: /^binairo generator$/i })).toBeVisible();
    await expect(page.locator(".inline-grid div").first()).toBeVisible();

    // Default 8×8 = 64 cells; switch to 6×6 = 36 cells.
    await expect(page.locator(".inline-grid div")).toHaveCount(64);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: /6 × 6/i }).click();
    await expect(page.locator(".inline-grid div")).toHaveCount(36);

    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("word wheel shows hub letter and solutions count", async ({ page }) => {
    await page.goto("/games/word-wheel");
    await expect(page.getByRole("heading", { name: /word wheel generator/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /word wheel preview/i })).toBeVisible();
    await expect(page.getByText(/\d+ possible words/i)).toBeVisible();
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled();
  });

  test("hangman lists rounds and filters by category", async ({ page }) => {
    await page.goto("/games/hangman");
    await expect(page.getByRole("heading", { name: /hangman sheet generator/i })).toBeVisible();
    await expect(page.getByText("Rounds", { exact: true })).toBeVisible();
    await expect(page.getByTestId("hangman-round")).toHaveCount(8);

    // Filter to one category: every round comes from that list.
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Animals" }).click();
    await expect(
      page.getByTestId("hangman-round").filter({ hasText: "Animals" })
    ).toHaveCount(8);
    await expect(
      page.getByTestId("hangman-round").filter({ hasText: /^(Jobs|Food|Places|Sports)$/ })
    ).toHaveCount(0);
  });

  test("new games are listed as ready on the hub", async ({ page }) => {
    await page.goto("/games");
    for (const slug of ["killer-sudoku", "binairo", "word-wheel", "hangman"]) {
      await expect(page.locator(`main a[href="/games/${slug}"]`)).toBeVisible();
    }
  });

  test("new routes are in the sitemap", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    for (const path of [
      "/games/killer-sudoku",
      "/games/binairo",
      "/games/word-wheel",
      "/games/hangman",
    ]) {
      expect(body).toContain(path);
    }
  });

  test("killer sudoku PDF downloads puzzle and answer pages", async ({ page }) => {
    await page.goto("/games/killer-sudoku");
    const downloadBtn = page.getByRole("button", { name: /generate & download pdf/i });
    await expect(downloadBtn).toBeEnabled({ timeout: 30_000 });
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await downloadBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^killer-sudoku-(easy|medium|hard|evil)-\d+\.pdf$/);
  });

  test("binairo PDF downloads with solution pages", async ({ page }) => {
    await page.goto("/games/binairo");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^binairo-\d+x\d+-\d+\.pdf$/);
  });

  test("word wheel PDF downloads with answer key", async ({ page }) => {
    await page.goto("/games/word-wheel");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^word-wheel-\d+words\.pdf$/);
  });

  test("hangman PDF downloads with answer key", async ({ page }) => {
    await page.goto("/games/hangman");
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page.getByRole("button", { name: /generate & download pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^hangman-\d+rounds\.pdf$/);
  });
});
