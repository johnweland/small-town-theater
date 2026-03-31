import { expect, test } from "@playwright/test";

test("homepage renders the starter content", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Small Town Theater" }),
  ).toBeVisible();
  await expect(page.getByText("Now you have a clean foundation")).toBeVisible();
});
