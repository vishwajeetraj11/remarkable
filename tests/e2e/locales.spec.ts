import { test, expect } from "@playwright/test";

test.describe("locale foundation", () => {
  test("localized hub serves correct html lang and switcher", async ({ page }) => {
    await page.goto("/de");
    await expect(page.evaluate(() => document.documentElement.lang)).resolves.toBe("de");
    await expect(
      page.getByRole("heading", { name: /spiele & rätsel/i })
    ).toBeVisible();
    // Manual switcher links to EN unprefixed equivalent.
    const enLink = page.locator('a[hreflang="en"][href="/games"]');
    await expect(enLink).toBeVisible();
  });

  test("/fr and /es hubs render", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.evaluate(() => document.documentElement.lang)).resolves.toBe("fr");
    await page.goto("/es");
    await expect(page.evaluate(() => document.documentElement.lang)).resolves.toBe("es");
  });

  test("registered localized puzzle pages resolve through the registry", async ({ page }) => {
    await page.goto("/de/wortsuchraetsel");
    await expect(page.locator("main")).toBeVisible();
    await page.goto("/fr/mots-fleches");
    await expect(page.locator("main")).toBeVisible();
  });

  test("schwedenraetsel renders German icon-clue grid and downloads", async ({ page }) => {
    await page.goto("/de/schwedenraetsel");
    await expect(
      page.getByRole("heading", { name: /schwedenrätsel generator/i })
    ).toBeVisible();
    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await page
      .getByRole("button", { name: /pdf erzeugen & herunterladen/i })
      .click();
    const d = await downloadPromise;
    expect(d.suggestedFilename()).toMatch(/^schwedenraetsel-\d+x\d+\.pdf$/);
  });

  test("unknown locales 404 instead of serving English", async ({ page }) => {
    const res = await page.goto("/pt");
    expect(res?.status()).toBe(404);
    const res2 = await page.goto("/de/nonexistent-game");
    expect(res2?.status()).toBe(404);
  });

  test("sitemap lists localized equivalents", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toContain("/de/spiele");
    expect(body).toContain("/fr/jeux");
    expect(body).toContain("/es/sopa-de-letras");
  });
});
