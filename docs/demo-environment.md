# Demo Environment Guide

## Por que a plataforma impressiona
- Pipeline de dados resiliente com latência baixa e auditoria por evento.
- Camada de risco/limites em tempo real, pronta para backtests e produção.
- Widgets de saúde operam com fetch ao vivo e degradam com dados de fallback.
- Painéis temáticos (claro/escuro) preservam legibilidade e hierarquia visual.

## UX rápida para demo
- Comece em um dashboard único com KPIs e status de serviços; evite navegação profunda.
- Prefira histórias curtas: “do dado bruto ao insight acionável” em 3 cliques.
- Use estados carregando/sucesso/alerta claros; nunca telas vazias.
- Mantenha textos de rótulo curtos e orientados a ação.

## Mock de 30 usuários
- Estrutura sugerida por usuário:
  - `id`, `nome`, `perfil` (`analista`, `pm`, `exec`), `regiao` (`NA`, `EU`, `LATAM`, `APAC`).
  - `uso_diario` (número de sessões), `tempo_medio_sessao` (min), `feature_top` (string).
  - `conversoes` (contagem), `alertas` (abertos/fechados).
- Distribuições para parecer real:
  - Perfis: 40% analista, 35% pm, 25% exec.
  - Regiões: 30% NA, 25% EU, 25% LATAM, 20% APAC.
  - Uso diário: média 3–6; tempo médio: 8–18 min; 10–15% heavy users (>8 sessões).
  - Feature top: escolha ponderada entre `dashboard_risco`, `backtest`, `alertas`, `export`.
- Geração rápida (exemplo JSON):
```
[
  {
    "id": "u-001",
    "nome": "User 1",
    "perfil": "analista",
    "regiao": "NA",
    "uso_diario": 5,
    "tempo_medio_sessao": 12,
    "feature_top": "backtest",
    "conversoes": 3,
    "alertas": {"abertos": 1, "fechados": 4}
  }
  // ... repetir até u-030 variando conforme distribuição
]
```

## Como plugar no ambiente demo
- Sirva mocks espelhando as rotas reais (mínimo):
  - Dashboard: `GET /api/v1/dashboard/kpis`, `/weekly-activity`, `/process-distribution`, health externo (`https://x.carla.money/health`, `https://carla-otp.vercel.app/health`).
  - Conversas: `GET /api/v1/conversations`, `GET /api/v1/conversations/:id`, `POST /api/v1/conversations/:id/messages`, `WS /api/v1/conversations/ws/:id`.
  - Transações: `GET /api/v1/transactions`, `GET /api/v1/transactions/:id`.
  - Processos público: `GET /api/v1/processes`, `POST /api/v1/processes`.
  - Procesos admin: `GET /admin/processes`, `GET /admin/processes/:id`, `GET /admin/processes/:id/events`, `POST /admin/processes/:id/{status|retry|rerun}`.
  - Demo users: `/api/demo/users` (30 perfis sintéticos).
- Disponibilize JSON estático em `public/api/...` ou mock server; mantenha fallback local.
- Ordene por `uso_diario` ou `tempo_medio_sessao` para evidenciar power users.
- Adicione microcópia explicando a amostra: “Dados sintéticos calibrados para tráfego global”.

