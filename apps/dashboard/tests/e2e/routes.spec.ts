import { expect, test } from "@playwright/test";

const routes = [
  ["/dashboard", "Dashboard"],
  ["/projects", "Projetos"],
  ["/lifecycle", "Ciclo de Vida"],
  ["/validation", "Validação e Conformidade"],
  ["/requirements", "Requisitos"],
  ["/analysis", "Análise"],
  ["/design", "Arquitetura e Projeto"],
  ["/implementation", "Implementação"],
  ["/testing", "Testes e Qualidade"],
  ["/deployment", "Implantação"],
  ["/maintenance", "Manutenção"],
  ["/reports", "Relatórios"],
  ["/settings", "Configurações"],
] as const;

test("the root route redirects to the dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page).toHaveTitle("Dashboard | Waterfall Lab");
});

for (const [path, title] of routes) {
  test(`${path} renders with its title`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(`${title} | Waterfall Lab`);
    await expect(page.getByRole("link", { name: title, exact: true }).first()).toBeVisible();
  });
}

test("sidebar navigation moves between screens", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Projetos", exact: true }).first().click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("unknown routes show the not found page", async ({ page }) => {
  await page.goto("/rota-inexistente");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
