import type { Metadata, Viewport } from "next";
import { Besley, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/site/motion-provider";
import { BRAND } from "@/content/lobeca";

// Duas famílias, as duas tiradas da própria marca (ver DESIGN.md):
// Besley é um revival da Clarendon, o desenho do logotipo "LO/BE/CA";
// Libre Franklin é o grotesco que acompanhava a Clarendon nos cartazes de
// tipos de madeira. Variáveis (um arquivo por família) e com `latin-ext`
// para os acentos do português.
const besley = Besley({
  variable: "--font-besley",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#000000" };

const description = `Barbearia em ${BRAND.city} – ${BRAND.state} há ${BRAND.years} anos. Agende corte e barba, conheça as assinaturas e o Dia do Noivo.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: BRAND.name, template: `%s — ${BRAND.name}` },
  description,
  openGraph: { title: BRAND.name, description, locale: "pt_BR", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${besley.variable} ${franklin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Pular para o conteúdo
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
