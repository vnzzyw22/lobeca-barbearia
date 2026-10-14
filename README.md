# Lobeca Barbershop — prévia

Site, agendamento e painel da Lobeca Barbershop (Apucarana – PR).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Sem `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, o projeto roda em **modo
demonstração**: agendamentos e solicitações ficam salvos só no navegador, e `/admin` abre o
painel de demonstração (sem login real). Detalhes em `CLAUDE.md`; direção de arte em
`DESIGN.md`; conteúdo editável em `src/content/lobeca.ts`.
