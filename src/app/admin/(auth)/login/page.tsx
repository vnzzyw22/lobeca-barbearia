import type { Metadata } from "next";
import { LobecaMark } from "@/components/site/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar no painel",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-brand-ink px-6">
      <LobecaMark className="h-24" title="Lobeca" />
      <h1 className="font-heading text-sm text-fog uppercase">Painel administrativo</h1>
      <LoginForm />
    </main>
  );
}
