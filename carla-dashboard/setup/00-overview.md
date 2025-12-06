# 00 - Overview

Objetivo: entregar um front fintech WhatsApp-first (Carla Channels) para cooperativas de crédito da Guatemala, 100% em espanhol, com estética nível Revolut+ e inteligência embarcada (data viz, CRM enriquecido, processos bancários).

Escopo mínimo (melhorar 100000x as referências):
- Dashboard BI: KPIs, atividade semanal, distribuição de processos, SLA, volume financeiro, insights automatizados.
- Conversaciones (CRM+WhatsApp): lista com filtros, chat em tempo real, perfil enriquecido (Graph API + backend), ações rápidas e timeline.
- Transacciones: tabela densa/kanban com filtros, progressos, prioridades e export.
- Procesos: catálogo de fluxos WhatsApp/banking com métricas de uso e gestão.

Pilares:
- Idioma: espanhol (Guatemala). Personas: agentes de cooperativas e operações.
- Dados: backend FastAPI + Meta Graph API + Banking API; front consome via `VITE_API_URL` + WS.
- UX/UI: tema dark cristalino, vidro/gradientes, microinterações rápidas, acessibilidade.
- Deploy: Netlify com contexts prod/deploy-preview e `netlify dev` local.

Check de aceite:
- Build sem warnings (`pnpm build`), lint OK, `netlify dev` OK (redirect SPA, headers).
- UI responde em <150ms interação, gráficos carregam com skeletons, estados de erro claros.
- Chat realtime funcional (WS ou fallback), filtros e export na tabela, processos gerenciáveis.

