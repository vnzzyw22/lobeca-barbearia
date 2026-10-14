// QA do painel de demonstração + integração com o site (mesmo navegador).
//   node scripts/qa-admin.mjs <baseUrl> <outDir> [width] [height]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3100", out = "qa-shots", w = "1440", h = "900"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const tag = `${w}x${h}`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
const page = await ctx.newPage();
const errors = [];
const checks = {};
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const shot = async (name, full = false) => {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${out}/admin-${tag}-${name}.png`, fullPage: full });
};
const go = async (path) => {
  await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(700);
};

await go("/admin");
await shot("0-entrada");
await page.getByRole("button", { name: "Entrar na demonstração" }).click();
await page.getByRole("heading", { name: "Visão geral" }).waitFor({ timeout: 30000 });
await shot("1-visao-geral", true);

// confirmar o primeiro pedido pendente
const confirmar = page.getByRole("button", { name: "Confirmar" }).first();
checks.pendentesAntes = await page.getByRole("button", { name: "Confirmar" }).count();
if (checks.pendentesAntes) {
  await confirmar.click();
  await page.waitForTimeout(400);
  checks.pendentesDepois = await page.getByRole("button", { name: "Confirmar" }).count();
}

for (const [path, heading, name] of [
  ["/admin/agenda", "Agenda", "2-agenda"],
  ["/admin/agendamentos", "Agendamentos", "3-agendamentos"],
  ["/admin/clientes", "Clientes", "4-clientes"],
  ["/admin/servicos", "Serviços e preços", "5-servicos"],
  ["/admin/equipe", "Profissionais", "6-profissionais"],
  ["/admin/configuracoes", "Configurações", "8-configuracoes"],
]) {
  await go(path);
  await page.getByRole("heading", { name: heading, exact: true }).waitFor({ timeout: 30000 });
  await shot(name, true);
}

// detalhe de agendamento na agenda (desktop: bloco da grade; celular: linha da lista)
await go("/admin/agenda");
const block = page.locator("main button[aria-label*=':']").first();
const listRow = page.locator("main section button").first();
const target = (await block.isVisible().catch(() => false)) ? block : listRow;
if (await target.count()) {
  await target.click();
  await page.getByRole("dialog").waitFor({ timeout: 10000 });
  await shot("2b-agenda-detalhe");
  await page.keyboard.press("Escape");
}

// editar preço do Corte e conferir no site
await go("/admin/servicos");
await page.getByRole("button", { name: "Editar Corte", exact: true }).click();
await page.fill("#sv-preco", "80,00");
await shot("5b-servico-editando");
await page.getByRole("button", { name: "Salvar alterações" }).click();
await page.waitForTimeout(400);
await go("/");
await page.locator("#servicos").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
checks.precoCorteNoSite = await page.locator('#servicos a[href="/agendar?servico=corte"]').getAttribute("aria-label");

// restaurar catálogo
await go("/admin/servicos");
await page.getByRole("button", { name: "Restaurar catálogo original" }).click();

// Dia do Noivo: envia solicitação e confere no painel
await go("/dia-do-noivo");
await page.locator("#orcamento").scrollIntoViewIfNeeded();
await page.fill("#noivo-nome", "Noivo Teste QA");
await page.fill("#noivo-whatsapp", "43988887777");
await page.fill("#noivo-data", "2026-12-12");
await page.fill("#noivo-pessoas", "4");
await page.fill("#noivo-mensagem", "Quero me arrumar com os padrinhos de manhã.");
await page.getByRole("button", { name: "Solicitar orçamento" }).click();
await page.waitForTimeout(700);
await page.locator("#orcamento").screenshot({ path: `${out}/admin-${tag}-noivo-enviado.png` });
await go("/admin/noivos");
await page.getByRole("heading", { name: "Dia do Noivo", exact: true }).waitFor({ timeout: 30000 });
checks.noivoNoPainel = await page.getByText("Noivo Teste QA").count();
await shot("7-noivos", true);

checks.overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ viewport: tag, checks, errors }, null, 2));
await browser.close();
