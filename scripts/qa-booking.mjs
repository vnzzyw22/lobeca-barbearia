// QA do agendamento (modo demonstração): percorre os 6 passos + envio e
// fotografa cada estado. Uso:
//   node scripts/qa-booking.mjs <baseUrl> <outDir> [width] [height]
// Requer playwright-core (npm i --no-save playwright-core) e o Chrome do sistema.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3100", out = "qa-shots", w = "1440", h = "900"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const tag = `${w}x${h}`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const shot = async (name) => {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/agendar-${tag}-${name}.png`, fullPage: false });
};
const next = async () => {
  await page.getByRole("button", { name: /^(Continuar|Enviar solicitação)$/ }).click();
  await page.waitForTimeout(450);
};

await page.goto(`${base}/agendar`, { waitUntil: "load", timeout: 120000 });
await page.getByRole("heading", { name: /Escolha o servi/ }).waitFor({ timeout: 60000 });
await shot("1-servico");

// passo sem escolha: deve mostrar a dica de erro
await next();
await shot("1b-servico-sem-escolha");

await page.locator('label:has(input[name="servico"][value="corte"])').click();
await shot("1c-servico-escolhido");
await next();
await shot("2-profissional");

await page.locator('label:has(input[name="profissional"])').first().click();
await next();
await shot("3-data");

await page.locator('label:has(input[name="dia"]:not([disabled]))').first().click();
await next();
await page.waitForSelector('input[name="horario"], text=Nenhum horário livre', { timeout: 8000 }).catch(() => {});
await shot("4-horario");

const slot = page.locator('label:has(input[name="horario"])').first();
if (await slot.count()) {
  await slot.click();
} else {
  // dia sem horário (ex.: fim do expediente hoje): volta e tenta o próximo dia aberto
  await page.getByRole("button", { name: "Escolher outro dia" }).click();
  await page.waitForTimeout(400);
  await page.locator('label:has(input[name="dia"]:not([disabled]))').nth(1).click();
  await next();
  await page.locator('label:has(input[name="horario"])').first().click();
}
await next();
await shot("5-dados");

await next(); // sem dados: erros inline
await shot("5b-dados-erros");
await page.fill("#nome", "Cliente Teste QA");
await page.fill("#whatsapp", "43999990000");
await next();
await shot("6-revisao");

await next();
await page.waitForTimeout(800);
await shot("7-confirmacao");

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ viewport: tag, horizontalOverflowPx: overflow, errors }, null, 2));
await browser.close();
