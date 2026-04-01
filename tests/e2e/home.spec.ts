import { expect, test } from "@playwright/test";

test("homepage renders the hero and main sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Now Playing").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "On Screen Now" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Visit Our Houses" }),
  ).toBeVisible();
});
