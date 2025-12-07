## Admin API (FastAPI) — Desenho e Endpoints

Contexto: expor operações administrativas na mesma API (FastAPI) já usada pelo dashboard (`/api/v1`), adicionando um namespace `/admin` protegido pela mesma auth/role do dashboard. Inclui ações manuais sobre dados e workers.

### Autenticação e segurança
- Reaproveitar o mecanismo atual do dashboard (ex.: OAuth2/JWT com role `admin`).
- Todas as rotas usam dependency de auth e verificação de role. Opcional: header `X-Request-Id`.
- CORS: liberar o domínio do painel (`https://carla-ui.netlify.app`).
- Rate limit mais restrito (ex.: 60 req/min por usuário admin) e proteção CSRF se houver cookies.
- Audit log obrigatório para qualquer mutação.

### Namespaces propostos
- `/api/v1/admin/health` — saúde do serviço.
- `/api/v1/admin/dashboard/*` — KPIs e métricas (leitura).
- `/api/v1/admin/users/*` — gestão de usuários/onboarding.
- `/api/v1/admin/verifications/*` — verificações (seed, cleanup, override de status).
- `/api/v1/admin/account-openings/*` — abertura de conta e estados.
- `/api/v1/admin/conversations/*` — CRM: conversas e mensagens.
- `/api/v1/admin/processes/*` — processos e reprocessamento.
- `/api/v1/admin/transactions/*` — transações e ajustes.
- `/api/v1/admin/jobs/*` — jobs/cron: listar, disparar, reprocessar itens.
- `/api/v1/admin/config/*` — feature flags, parâmetros operacionais.
- `/api/v1/admin/audit/*` — consulta a auditoria.

### Modelos base (Pydantic)
- `UserAdmin`: id, phone, email, status, created_at, updated_at, flags.
- `Verification`: id, user_id, status, provider, attempt_count, metadata, updated_at.
- `AccountOpening`: id, user_id, status, document_number, phone_e164, steps, updated_at.
- `JobRun`: id, name, status, started_at, finished_at, result, error.
- `AuditEntry`: id, actor, action, entity_type, entity_id, payload, result, created_at.

### Endpoints detalhados

#### Health e observabilidade
- `GET /api/v1/admin/health` — delega para `/health` com info extra (uptime, dependências).
- `GET /api/v1/admin/metrics` — métricas agregadas (latências, filas).

#### Dashboard / KPIs
- `GET /api/v1/admin/dashboard/kpis?period=7d|30d|90d` — mesma resposta usada pelo dashboard público, sem cache forçado.
- `GET /api/v1/admin/dashboard/weekly-activity?period=...`
- `GET /api/v1/admin/dashboard/process-distribution?period=...`

#### Usuários / onboarding
- `GET /api/v1/admin/users?search=&status=&page=&page_size=` — lista com filtros.
- `GET /api/v1/admin/users/{user_id}` — detalhe + estados de onboarding.
- `PATCH /api/v1/admin/users/{user_id}` — atualizar campos operacionais (ex.: flags, notas).
- `POST /api/v1/admin/users/{user_id}/status` — forçar status (ex.: `approved`, `blocked`, `needs_review`).
- `POST /api/v1/admin/users/{user_id}/resend-whatsapp` — reenviar mensagens-chave.

#### Verificações
- `POST /api/v1/admin/verifications/seed-test-user` — replica `.../seed-webhook-test-user`.
- `POST /api/v1/admin/verifications/cleanup-test-data` — replica `.../cleanup-test-data?delete_all=true`.
- `GET /api/v1/admin/verifications?status=&provider=&user_id=` — listar.
- `GET /api/v1/admin/verifications/{verification_id}` — detalhe.
- `POST /api/v1/admin/verifications/{verification_id}/status` — override de status (`pending|verified|rejected`), com motivo.
- `POST /api/v1/admin/verifications/{verification_id}/reprocess` — reenfileirar no worker.

#### Account openings
- `GET /api/v1/admin/account-openings?status=&user_id=&doc=` — lista.
- `GET /api/v1/admin/account-openings/{id}` — detalhe (inclui `didit_status`, `qic_status`, etc.).
- `POST /api/v1/admin/account-openings/{id}/status` — forçar status ou step atual.
- `POST /api/v1/admin/account-openings/{id}/reprocess` — enviar ao worker responsável.
- `POST /api/v1/admin/account-openings/{id}/attach-doc` — anexar/atualizar documento manualmente.

#### Conversas (CRM)
- `GET /api/v1/admin/conversations` — lista com filtros (`product`, `status`, `tag`).
- `GET /api/v1/admin/conversations/{id}` — detalhe + mensagens.
- `POST /api/v1/admin/conversations/{id}/messages` — enviar mensagem manual com attribution admin.
- `POST /api/v1/admin/conversations/{id}/assign` — atribuir agente.

#### Processos
- `GET /api/v1/admin/processes` — lista processos/definições.
- `GET /api/v1/admin/processes/{id}` — detalhe.
- `POST /api/v1/admin/processes` — criar/duplicar processo.
- `POST /api/v1/admin/processes/{id}/reprocess` — reenfileirar execução.
- `POST /api/v1/admin/processes/{id}/status` — forçar etapa/percentual.

#### Transações
- `GET /api/v1/admin/transactions?filters...` — lista.
- `GET /api/v1/admin/transactions/{id}` — detalhe.
- `POST /api/v1/admin/transactions/{id}/status` — ajuste de status/tag/prioridade.
- `POST /api/v1/admin/transactions/{id}/reconcile` — reconciliar divergências.

#### Jobs / Cron / Worker
- `GET /api/v1/admin/jobs` — lista jobs/cron configurados (ex.: `/cron/account-openings`).
- `POST /api/v1/admin/jobs/{job_name}/run` — dispara manualmente.
- `POST /api/v1/admin/jobs/{job_name}/dry-run` — execução sem efeitos.
- `GET /api/v1/admin/jobs/{job_name}/runs` — histórico.
- `POST /api/v1/admin/jobs/{job_name}/runs/{run_id}/retry` — reprocessar run.
- `POST /api/v1/admin/work-items/{item_id}/retry` — reprocessar item específico na fila.
- `POST /api/v1/admin/work-items/{item_id}/status` — forçar status de item (com motivo).

#### Configuração / Feature flags
- `GET /api/v1/admin/config` — valores atuais.
- `PATCH /api/v1/admin/config` — atualizar flags ou parâmetros operacionais validados.

#### Auditoria
- `GET /api/v1/admin/audit?actor=&action=&entity_type=&entity_id=&from=&to=` — consulta audit log.

### Exemplo de wire (FastAPI)
```python
router = APIRouter(prefix=\"/api/v1/admin\", dependencies=[Depends(require_admin)])

@router.get(\"/health\", response_model=HealthPayload)
def health(info=Depends(health_service.get_info)):
    return info

@router.post(\"/verifications/{verification_id}/status\", response_model=Verification)
def override_verification_status(verification_id: UUID, body: StatusChange, actor=Depends(current_admin)):
    result = verification_service.override_status(verification_id, body.status, body.reason, actor.id)
    audit.log(actor=actor, action=\"verification.status.override\", entity_id=verification_id, payload=body.model_dump())
    return result
```

### Observabilidade e controles
- Audit log estruturado para toda mutação (actor, ação, entidade, payload, resultado).
- Métricas: contadores por rota, histogramas de latência, contagem de reprocessamentos e overrides.
- Idempotência para operações de reprocessamento (chaves por item/run).
- Paginação padrão: `page`, `page_size` (limite sugerido 100).

### Próximos passos de implementação
1. Criar routers FastAPI `app/api/admin/*.py` com dependency `require_admin`.
2. Conectar serviços existentes (verifications, onboarding, cron) e expor ações de worker.
3. Adicionar audit logger e métricas por rota.
4. Validar CORS e rate limit específicos para admin.

