import { expect, test } from "@playwright/test";

test.describe("visual smoke", () => {
  test("dashboard renders key operational regions", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Média de rating")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Feedbacks recentes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Depoimentos aprovados" })).toBeVisible();
  });

  test("public feedback page keeps the submit form visible", async ({ page }) => {
    await page.goto("/feedback/demo-clinic");

    await expect(page.getByRole("heading", { name: /Conte como foi sua experiência/ })).toBeVisible();
    await expect(page.getByLabel("Comentário")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar feedback" })).toBeVisible();
  });
});
