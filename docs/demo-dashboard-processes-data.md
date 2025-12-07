# Demo data: Dashboard + Procesos

## Endpoints consumidos (para mock)
- Dashboard:
  - `GET /api/v1/dashboard/kpis`
  - `GET /api/v1/dashboard/weekly-activity?period=...`
  - `GET /api/v1/dashboard/process-distribution?period=...`
  - Health externo: `GET https://x.carla.money/health`, `GET https://carla-otp.vercel.app/health`
- Conversas:
  - `GET /api/v1/conversations`
  - `GET /api/v1/conversations/:id`
  - `POST /api/v1/conversations/:id/messages`
  - `WS  /api/v1/conversations/ws/:id`
- Transações:
  - `GET /api/v1/transactions?filters...`
  - `GET /api/v1/transactions/:id`
- Processos (público):
  - `GET /api/v1/processes?q=...`
  - `POST /api/v1/processes`
- Processos (admin / tela Procesos):
  - `GET /admin/processes?q&status&phone&limit`
  - `GET /admin/processes/:id`
  - `GET /admin/processes/:id/events`
  - Ações: `POST /admin/processes/:id/status`, `POST /admin/processes/:id/retry`, `POST /admin/processes/:id/rerun`

## Valor estratégico (UX demo)
- Dashboard: KPIs e trends mostram controle de operação; weekly activity expõe uso multicanal; distribution revela mix de produtos; health reforça confiabilidade/latência e pool de conexões.
- Procesos: lista com status/banking/verification dá confiança de compliance; timeline de eventos evidencia rastreabilidade; ações retry/rerun/status evidenciam governança e recuperação.

## Mocks (30 itens) alinhados aos schemas
- KPIs (usar 5 visíveis, mas manter 30 no payload para alternar): campos `id,label,value,delta,helper`.
- Weekly activity: 30 pontos (últimos 30 dias) com `label` e `breakdown` empilhado (ex: `credito`, `transfer`, `kyc_fail`).
- Process distribution: 6-8 tipos somando 100%; gere 30 registros rotativos para suportar drill e legendas variadas.
- Health: 10 serviços core + OTP; varie `status` entre ok/warn/error e `latency_ms` 80–650; inclua `connection_pool` com `active/max`.
- Procesos admin: 30 cards com `id,name,phone,status,banking_status,verification_status,attempts,events_count,last_error,updated_at`. Distribuição sugerida: 60% ready/processing, 20% retry, 15% rejected/error, 5% created.
- Eventos por processo: para 30 processos, 4–8 eventos cada (`id,type,status,step,message,correlation_id,created_at`), incluindo um com falha para alimentar alertas.

## Injeção no ambiente demo (sem código novo)
- Sirva JSON estático em `public/api/v1/...` espelhando rotas acima ou use mock server; o fetch já lida com fallback.
- Garanta 30 entradas reais por array principal; mantenha consistência de chaves conforme `src/lib/schemas.ts`.
- Varie métricas para estados ricos: ao menos 3 itens `error`, 5 `warn`, restante `ok`, preservando coerência entre lista, detalhe e eventos.

