// QA leve: área do cliente (cliente de exemplo assinante) + financeiro do painel.
//   node scripts/qa-cliente.mjs <baseUrl> <outDir> [width] [height]
import { chromium } from "playwright-core";
const [base = "http://localhost:3000", out = ".", w = "1440", h = "900"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-gpu", "--js-flags=--max-old-space-size=256"] });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(`${base}/cliente`, { waitUntil: "load", timeout: 120000 });
await p.getByRole("button", { name: /assinante/ }).first().click();
await p.getByRole("heading", { name: /Olá,/ }).waitFor({ timeout: 30000 });
await p.waitForTimeout(1500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 400) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(120); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
console.log(JSON.stringify({ overflowPx: await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) }));
await p.screenshot({ path: `${out}/cliente-${w}.png`, fullPage: true });
await p.goto(`${base}/admin/financeiro`, { waitUntil: "load", timeout: 120000 });
const entrar = p.getByRole("button", { name: "Entrar na demonstração" });
if (await entrar.count()) await entrar.click();
await p.getByRole("heading", { name: "Financeiro", exact: true }).waitFor({ timeout: 60000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/financeiro-${w}.png`, fullPage: true });
console.log(JSON.stringify({ errors }));
await b.close();
