// QA do agendamento (modo demonstração): profissional → serviços (vários) →
// dia → horário → dados → revisão → envio. Fotografa cada estado.
//   node scripts/qa-booking.mjs <baseUrl> <outDir> [width] [height]
// Requer playwright-core (npm i --no-save playwright-core) e o Chrome do sistema.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3000", out = "qa-shots", w = "1440", h = "900"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const tag = `${w}x${h}`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
const page = await ctx.newPage();
const errors = [];
const checks = {};
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const shot = async (name) => {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/agendar-${tag}-${name}.png` });
};
const next = async () => {
  await page.getByRole("button", { name: /^(Continuar|Enviar solicitação)$/ }).click();
  await page.waitForTimeout(500);
};

await page.goto(`${base}/agendar`, { waitUntil: "load", timeout: 120000 });
await page.getByRole("heading", { name: /Com quem/ }).waitFor({ timeout: 60000 });
await shot("1-profissional");
await next();
await shot("1b-sem-escolha");

await page.locator('label:has(input[name="profissional"])').nth(1).click();
await next();
await page.locator('label:has(input[name="servicos"][value="corte"])').click();
await page.locator('label:has(input[name="servicos"][value="barba"])').click();
await shot("2-servicos");
checks.resumoServicos = await page.getByText(/2 serviços, cerca de/).first().textContent().catch(() => null);
await next();
await shot("3-data");

const days = page.locator('label:has(input[name="dia"]:not([disabled]))');
await days.first().click();
await next();
await page.waitForSelector('input[name="horario"], text=Nenhum horário livre', { timeout: 10000 }).catch(() => {});
if (!(await page.locator('label:has(input[name="horario"])').count())) {
  await page.getByRole("button", { name: "Escolher outro dia" }).click();
  await page.waitForTimeout(500);
  await days.nth(1).click();
  await next();
}
await shot("4-horario");
await page.locator('label:has(input[name="horario"])').first().click();
await next();
await shot("5-dados");
await page.fill("#nome", "Cliente Teste QA");
await page.fill("#whatsapp", "43999990000");
await next();
await shot("6-revisao");
checks.revisaoServicos = await page.getByText("Corte + Barba").first().textContent().catch(() => null);
await next();
await page.waitForTimeout(900);
await shot("7-confirmacao");
checks.confirmado = await page.getByRole("heading", { name: /Pedido simulado/ }).count();

checks.overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ viewport: tag, checks, errors }, null, 2));
await browser.close();
