import { expect, test } from "@playwright/test";

test("public feedback page submits a customer comment", async ({ page }) => {
  await page.route("**/api/feedback", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          feedbackId: "00000000-0000-0000-0000-000000000001",
          analysisStatus: "completed"
        }
      })
    });
  });

  await page.goto("/feedback/demo-clinic");
  await page.getByLabel("Nota").selectOption("9");
  await page.getByLabel("Comentário").fill("Equipe atenciosa e atendimento rápido.");
  await page.getByLabel("Nome").fill("Ana");
  await page.getByLabel("E-mail").fill("ana@example.com");
  await page.getByRole("button", { name: "Enviar feedback" }).click();

  await expect(page.getByText("Feedback recebido")).toBeVisible();
});
