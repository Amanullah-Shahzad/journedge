import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

const journedgeCsv = `Date,Symbol,Underlying,Type,Direction,Option Type,Strike,Expiry,Quantity,Entry Price,Exit Price,Commission,Fees,P&L,Status,Entry Time,Exit Time,R:R,Tags,Journal,Account ID
"2026-05-30","AAPL","AAPL","stock","long","","","","10","190","191.5","1","0","14","win","09:30","10:00","1:1.5","imported|smoke","Imported from smoke test",""`;

test.describe("frontend smoke", () => {
  test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run smoke tests.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(email as string);
    await page.getByPlaceholder("Password").fill(password as string);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("loads dashboard", async ({ page }) => {
    await expect(page.getByText("Trade History")).toBeVisible();
  });

  test("logs out and redirects protected navigation", async ({ page }) => {
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("creates a manual trade", async ({ page }) => {
    await page.getByRole("button", { name: "Add Trade" }).click();
    await page.getByPlaceholder("e.g. SPXW260220C6955 or AAPL or /ES").fill("AAPL");
    await page.getByPlaceholder("0.00").first().fill("190");
    await page.getByPlaceholder("0.00").nth(1).fill("191.5");
    await page.getByPlaceholder("1").fill("10");
    await page.getByRole("button", { name: "Save Trade" }).click();
    await expect(page.getByText("AAPL").first()).toBeVisible();
  });

  test("imports a csv through the UI", async ({ page }) => {
    await page.getByRole("button", { name: "Import Trades" }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "smoke-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(journedgeCsv, "utf-8"),
    });

    await expect(page.getByText(/ready to import/i)).toBeVisible();
    await page.getByRole("button", { name: "Confirm Import" }).click();
    await expect(page.getByText("Dashboard")).toBeVisible();
  });
});
