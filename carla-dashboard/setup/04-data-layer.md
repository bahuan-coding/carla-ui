# 04 - Data Layer

Base:
- `VITE_API_URL` apontando para backend Carla (FastAPI). Cliente fetch/axios com header `Authorization: Bearer {token}`.
- TanStack Query v5: `staleTime` 5m KPIs, retries 1-2, suspense-ready opcional, devtools off em prod.
- Zod para validar respostas críticas.

Endpoints alvo (exemplo):
- GET `/api/v1/dashboard/kpis`
- GET `/api/v1/dashboard/weekly-activity`
- GET `/api/v1/dashboard/process-distribution`
- GET `/api/v1/conversations` ; GET `/api/v1/conversations/{id}` ; POST `/api/v1/conversations/{id}/messages`
- GET `/api/v1/transactions`
- GET/POST/PUT `/api/v1/processes`

WebSocket:
- `wss://.../ws/conversations/{conversationId}` para chat ao vivo; reconexão exponencial; fallback polling.

Estratégia:
- Hooks por domínio (`useKpis`, `useWeeklyActivity`, `useConversations`, `useTransactions`, `useProcesses`, `useSendMessage` mutation).
- Estados padrão: loading -> skeleton; error -> toast + ação “Reintentar”.
- Paginação/virtualização para listas grandes (Transacciones).
- Cache keys bem definidas (`['conversations', filters]`, etc).

