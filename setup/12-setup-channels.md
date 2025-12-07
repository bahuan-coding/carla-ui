# Setup Channels — API spec (Carla Channels)

Base URL: `https://x.carla.money` (per Vercel secret `CHANNELS_API_URL`). Auth: `Authorization: Bearer <token>`. Responses JSON; errors `{status,message,error?}`.

Data sources: Postgres (Neon) tables `account_openings`, `account_opening_beneficiaries`, `banking_events`, `flow_sessions`, `users`, `messages`, `agent_routing`, `phone_mappings`, `phone_prefixes`; Redis/Upstash for OTP/idempotency (not exposed to UI).

## Dashboard
- GET `/api/v1/dashboard/kpis?period=iso-week|month|custom` → `[{id?,label,value,delta?,trend?,helper?}]`
- GET `/api/v1/dashboard/weekly-activity?period=...` → `[{label,total?,breakdown:{[name]:number}}]`
- GET `/api/v1/dashboard/process-distribution?period=...` → `[{name,value}]`
Notes: compute from `account_openings.status`, `banking_events`, `messages`. Return zeros when empty. Cache hint: 5m.

## Conversaciones (CRM/WhatsApp)
- GET `/api/v1/conversations` → `[{id,name,product?,status?,unread?,updatedAt?,tags?}]`  
  Source: latest `messages` + `account_openings` profile; order by `updatedAt` desc.
- GET `/api/v1/conversations/{id}` → `{id,name,product?,status?,phone?,unread?,tags[],proceso?,progreso?,assignedTo?,messages:[{id?,from,body,at,direction?}],profile:{email?,location?,lastSeen?}}`
- POST `/api/v1/conversations/{id}/messages` body `{text}` → message echo `{id?,from,body,at,direction}`; also fanout to WhatsApp/Broker.
- WS `/api/v1/conversations/ws/{id}` → server-push `message` payload same as schema.
Notes: mask PII (doc, address). Preserve ordering by `at`. Mark unread->0 on fetch.

## Transacciones
- GET `/api/v1/transactions?q?,prioridad?` → `[{id,cliente,proceso,etapa?,progreso?,tiempo?,prioridad?,tag?,slaBreached?}]`
  Mapping: `account_openings` (`cliente` from name/phone), `proceso` from product/workflow, `progreso` from status progression, `tiempo` from `created_at` to now or stage elapsed, `slaBreached` from SLA rules.
- GET `/api/v1/transactions/{id}` → same shape single record.
Notes: support pagination (`page,size`), sorting (`sort=updatedAt|-progreso`). Use filters for backlog views.

## Procesos (Flows catalog)
- GET `/api/v1/processes?q?` → `[{id,nombre,estado,pasos?,uso?,updated?}]`
- POST `/api/v1/processes` body `{nombre,estado,definicion?...}` → created process (same schema). Used for create/duplicate actions.
Notes: `estado` active/inactive; `pasos` derived from flow graph; `uso` usage summary (runs, success rate) from `flow_sessions` and `account_openings`.

## Cross-cutting
- Auth: Bearer token validated; optional role check for admin routes (cleanup, retry bank, etc.).
- Pagination defaults: `page=1,size=20`, include `total`.
- Frontend env: set `VITE_API_URL=https://x.carla.money` and `VITE_API_TOKEN` (from `CHANNELS_API_KEY`); runtime token override via `localStorage.carla_token` if present.
- Idempotency: inbound WhatsApp dedupe via `msg:{wamid}:processed` (KV); outbound send should accept optional `Idempotency-Key`.
- Rate limits: sensible defaults (e.g., 60 req/min per agent) to protect backend.
- Observability: include `request_id` header in responses; log correlation to `banking_events`.
- Error handling: 4xx for validation/auth; 5xx generic; avoid leaking raw bank/RENAP/Didit payloads.

