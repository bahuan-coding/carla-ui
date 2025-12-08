import { useState } from 'react';
import { ArrowLeft, Database, Gauge, Layers, Link2, Radar, RefreshCw, Rocket, Server, ShieldCheck, Terminal, Workflow, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox';

type Field = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  helper?: string;
  defaultValue?: string | number | boolean;
  inQuery?: boolean;
};

type Endpoint = {
  id: string;
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  description: string;
  displayTitle?: string;
  fields?: Field[];
  tags?: string[];
  danger?: boolean;
};

type Group = {
  id: string;
  label: string;
  accent: string;
  icon: any;
  summary: string;
  endpoints: Endpoint[];
};

const boolField = (name: string, label: string, def = true): Field => ({ name, label, type: 'checkbox', defaultValue: def });

const qaEndpoints: Endpoint[] = ['blacklist', 'client', 'complementary', 'account', 'onboarding-update', 'complementary-update', 'complement-query'].map((slug) => ({
  id: `qa-${slug}`,
  method: 'POST' as const,
  path: `/admin/qa/banking/${slug}`,
  description: `Prueba bancaria (qa/banking/${slug}): envía payload controlado con dry_run para validar integración.`,
  fields: [
    { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
    boolField('dry_run', 'Modo prueba (no ejecuta)', true),
    { name: 'payload', label: 'Payload (JSON)', type: 'textarea', placeholder: '{...}' },
  ],
  tags: ['dry_run'],
  danger: false,
}));

const workerRunFields: Field[] = [
  { name: 'batch_size', label: 'Tamaño del lote', type: 'number', placeholder: '50' },
  { name: 'max_retries', label: 'Reintentos máx', type: 'number', placeholder: '3' },
  { name: 'limit_ids', label: 'IDs (coma)', placeholder: 'id1,id2' },
];

const endpointGroups: Group[] = [
  {
    id: 'verifications',
    label: 'Verificaciones',
    accent: 'text-emerald-300',
    icon: ShieldCheck,
    summary: 'Identidad, OTP y validaciones críticas. Úsalo para destrabar onboarding rápido cuando QIC/RENAP fallan o revisar timeline.',
    endpoints: [
      {
        id: 'ver-stats',
        method: 'GET',
        path: '/admin/verifications/stats',
        displayTitle: 'Banking Bridge Status',
        description: 'Visión general de verificaciones: cuenta aprobadas, pendientes o con error para detectar cuellos de botella.',
      },
      {
        id: 'ver-stuck',
        method: 'GET',
        path: '/admin/verifications/stuck',
        description: 'Encuentra verificaciones atascadas por horas para que el equipo las libere manualmente (stuck).',
        fields: [{ name: 'hours', label: 'Horas en espera', type: 'number', placeholder: '24', inQuery: true }],
      },
      {
        id: 'ver-approve',
        method: 'POST',
        path: '/admin/verifications/{account_opening_id}/approve-manual',
        description: 'Aprueba manualmente la apertura (approve-manual) cuando ya validaste identidad y QIC falló; marca OTP verificado y sigue al flujo bancario.',
        fields: [
          { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
          { name: 'operator', label: 'Operador (correo)', placeholder: 'agente@carla.gt' },
          { name: 'reason', label: 'Motivo', placeholder: 'Justificación' },
        ],
        danger: true,
      },
      {
        id: 'ver-reject',
        method: 'POST',
        path: '/admin/verifications/{account_opening_id}/reject-manual',
        description: 'Rechaza manualmente (reject-manual) cuando el documento es inválido o sospechoso; detiene el flujo y registra la causa.',
        fields: [
          { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
          { name: 'reason', label: 'Motivo', placeholder: 'Por qué rechazar' },
          { name: 'operator', label: 'Operador (correo)', placeholder: 'agente@carla.gt' },
        ],
        danger: true,
      },
      {
        id: 'ver-status-phone',
        method: 'GET',
        path: '/admin/verifications/status/{phone}',
        description: 'Consulta estado por teléfono para responder rápido “¿ya pasé?” vía WhatsApp.',
        fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502 55 55 55 55' }],
      },
      {
        id: 'ver-status-timeline',
        method: 'GET',
        path: '/admin/verifications/{account_opening_id}/verify/status',
        description: 'Muestra historial completo (OTP, RENAP, DIDIT, QIC) para saber dónde se trabó (verify/status).',
        fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }],
      },
      {
        id: 'ver-renap',
        method: 'POST',
        path: '/admin/verifications/{account_opening_id}/verify/renap',
        description: 'Lanza de nuevo RENAP (verify/renap) cuando necesitas revalidar dato civil.',
        fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }],
      },
      {
        id: 'ver-phone-campaign',
        method: 'POST',
        path: '/admin/verifications/phone-campaign/trigger',
        description: 'Activa la campaña OTP (phone-campaign trigger) para enviar códigos en lote a quienes no validaron.',
        fields: [
          { name: 'batch_size', label: 'Cantidad de envíos', type: 'number', placeholder: '50' },
          { name: 'exclude_recent_hours', label: 'Ignorar envíos de las últimas (h)', type: 'number', placeholder: '24' },
        ],
      },
      {
        id: 'ver-otp-resend',
        method: 'POST',
        path: '/admin/verifications/otp/resend',
        description: 'Reenvía OTP (otp/resend) al mismo número; úsalo cuando reporta no haberlo recibido.',
        fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...' }, { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }],
      },
      {
        id: 'ver-otp-override',
        method: 'POST',
        path: '/admin/verifications/otp/mark-verified',
        description: 'Marca OTP como verificado (otp/mark-verified) después de confirmar manualmente la línea.',
        fields: [
          { name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...' },
          { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
          { name: 'operator', label: 'Operador (correo)', placeholder: 'agente@carla.gt' },
          { name: 'reason', label: 'Motivo', placeholder: 'Justificación' },
        ],
        danger: true,
      },
      { id: 'ver-didit-regenerate', method: 'POST', path: '/admin/verifications/{id}/didit/regenerate', description: 'Genera un nuevo enlace DIDIT (didit/regenerate) para reenviar al cliente.', fields: [{ name: 'id', label: 'ID de verificación', placeholder: 'verif id' }] },
      {
        id: 'ver-didit-override',
        method: 'POST',
        path: '/admin/verifications/{id}/didit/override',
        description: 'Ajusta manualmente el estado DIDIT (didit/override: approved, rejected, pending, error) y registra nota.',
        fields: [
          { name: 'id', label: 'ID de verificación', placeholder: 'verif id' },
          { name: 'status', label: 'Status', type: 'select', options: ['approved', 'rejected', 'pending', 'error'].map((v) => ({ label: v, value: v })) },
          { name: 'note', label: 'Nota', placeholder: 'Nota breve' },
        ],
      },
    ],
  },
  {
    id: 'banking',
    label: 'Banca y Onboarding',
    accent: 'text-sky-300',
    icon: Database,
    summary: 'Estado bancario de las aperturas, reintentos y payloads. Útil para seguir casos con el banco y limpiar errores.',
    endpoints: [
      { id: 'bank-poller', method: 'GET', path: '/admin/banking/client-poller', description: 'Ejecuta la cola bancaria (client-poller) y muestra detalle por cliente para seguimiento.', fields: [{ name: 'limit', label: 'Límite', type: 'number', placeholder: '50', inQuery: true }, boolField('include_events', 'Ver timeline', true)] },
      { id: 'bank-ready', method: 'GET', path: '/account-openings/ready-for-bank', description: 'Lista aperturas listas para enviar al banco (ready-for-bank) para priorizar backlog.', fields: [{ name: 'limit', label: 'Límite', type: 'number', placeholder: '50', inQuery: true }] },
      {
        id: 'bank-status',
        method: 'POST',
        path: '/admin/banking/{id}/status',
        description: 'Cambia manualmente el estado bancario (status) entre retry, created, etc.',
        fields: [
          { name: 'id', label: 'ID bancario', placeholder: 'id banco' },
          { name: 'status', label: 'Status', type: 'select', options: ['ready_for_bank', 'bank_queued', 'bank_processing', 'bank_retry', 'bank_rejected', 'account_created'].map((v) => ({ label: v, value: v })) },
          { name: 'reason', label: 'Motivo', placeholder: 'Por qué cambiar' },
        ],
        danger: true,
      },
      { id: 'bank-retry', method: 'POST', path: '/admin/banking/{id}/retry', description: 'Recoloca el caso en la fila de retry y limpia el último error (retry).', fields: [{ name: 'id', label: 'ID bancário', placeholder: 'id banco' }] },
      {
        id: 'bank-payload',
        method: 'POST',
        path: '/admin/banking/{id}/payload/save',
        description: 'Guarda request/response bancario (payload/save) para auditoría.',
        fields: [
          { name: 'id', label: 'ID bancario', placeholder: 'id banco' },
          { name: 'request_payload', label: 'Request (JSON)', type: 'textarea', placeholder: '{...}' },
          { name: 'response_payload', label: 'Response (JSON)', type: 'textarea', placeholder: '{...}' },
        ],
      },
      { id: 'bank-events', method: 'GET', path: '/admin/banking/events/{id}', description: 'Timeline del caso bancario (events) con todo lo enviado y recibido.', fields: [{ name: 'id', label: 'ID bancario', placeholder: 'id banco' }] },
    ],
  },
  {
    id: 'workers',
    label: 'Workers y Cron',
    accent: 'text-amber-300',
    icon: Server,
    summary: 'Forzar corridas o pausar colas críticas (cron/workers) cuando hay backlog o incidentes.',
    endpoints: [
      { id: 'cron-account-openings', method: 'GET', path: '/cron/account-openings', description: 'Ejecuta el cron de aperturas; útil en pruebas para forzar corrida.', fields: [] },
      { id: 'cron-phone-campaign', method: 'GET', path: '/cron/phone-verification-campaign', description: 'Lanza cron de campaña OTP de forma inmediata.', fields: [] },
      { id: 'worker-account-openings', method: 'POST', path: '/admin/workers/account-openings/run', description: 'Procesa aperturas en lote ahora (account-openings/run) aunque el cron no corra.', fields: workerRunFields },
      { id: 'worker-phone-campaign', method: 'POST', path: '/admin/workers/phone-campaign/run', description: 'Procesa campaña OTP en lote inmediatamente (phone-campaign/run).', fields: workerRunFields },
      { id: 'worker-banking', method: 'POST', path: '/admin/workers/banking/run', description: 'Dispara worker bancario (banking/run) para enviar o actualizar casos.', fields: [{ name: 'limit', label: 'limit', type: 'number', placeholder: '50' }, boolField('include_events', 'include_events', true)] },
      { id: 'worker-pause', method: 'POST', path: '/admin/workers/pause', description: 'Pausa un worker específico (pause) para detener colas.', fields: [{ name: 'worker', label: 'Nombre del worker', placeholder: 'account-openings' }, { name: 'reason', label: 'Motivo', placeholder: '¿Por qué?' }] },
      { id: 'worker-resume', method: 'POST', path: '/admin/workers/resume', description: 'Reactiva un worker pausado (resume) con justificación.', fields: [{ name: 'worker', label: 'Nombre del worker', placeholder: 'account-openings' }, { name: 'reason', label: 'Motivo', placeholder: '¿Por qué?' }] },
      { id: 'worker-status', method: 'GET', path: '/admin/workers/status', description: 'Consulta último run, locks y estado de cada worker (status).', fields: [] },
    ],
  },
  {
    id: 'accounts',
    label: 'Aperturas de cuenta',
    accent: 'text-purple-300',
    icon: Layers,
    summary: 'Consultas y acciones sobre cuentas y aperturas: buscar por teléfono/documento, notas internas y owners.',
    endpoints: [
      { id: 'ao-by-id', method: 'GET', path: '/account-openings/{id}', description: 'Consulta una apertura por ID para ver su estado completo.', fields: [{ name: 'id', label: 'ID de apertura', placeholder: 'uuid' }] },
      { id: 'ao-by-phone', method: 'GET', path: '/account-openings/by-phone', description: 'Busca apertura por teléfono (by-phone), útil para soporte rápido.', fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...', inQuery: true }] },
      { id: 'ao-by-document', method: 'GET', path: '/account-openings/by-document', description: 'Busca por documento DPI (by-document) para confirmar identidad.', fields: [{ name: 'document', label: 'Documento (DPI)', placeholder: 'DPI', inQuery: true }] },
      { id: 'ao-trigger-worker', method: 'POST', path: '/account-openings/trigger-worker', description: 'Dispara el worker de aperturas (trigger-worker) para reprocesar manualmente.', fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }], danger: true },
      { id: 'ao-status-phone', method: 'GET', path: '/account-openings/status/{phone_number}', description: 'Ayuda de verificación por teléfono (status) para clientes.', fields: [{ name: 'phone_number', label: 'Teléfono (+502)', placeholder: '+502...' }] },
      { id: 'acc-tags', method: 'POST', path: '/admin/accounts/{id}/tags', description: 'Administra tags (add/remove) para segmentar la cuenta.', fields: [{ name: 'id', label: 'ID de la cuenta', placeholder: 'account id' }, { name: 'action', label: 'Acción', type: 'select', options: ['add', 'remove'].map((v) => ({ label: v, value: v })) }, { name: 'tags', label: 'Tags (coma)', placeholder: 'vip,aml' }] },
      { id: 'acc-note', method: 'POST', path: '/admin/accounts/{id}/note', description: 'Agrega nota interna breve para dejar contexto rápido (note).', fields: [{ name: 'id', label: 'ID de la cuenta', placeholder: 'account id' }, { name: 'note', label: 'Nota', placeholder: 'Observación', type: 'textarea' }] },
      { id: 'acc-assign', method: 'POST', path: '/admin/accounts/{id}/assign', description: 'Asigna responsable (assign) para seguimiento claro.', fields: [{ name: 'id', label: 'ID de la cuenta', placeholder: 'account id' }, { name: 'owner', label: 'Responsable (email)', placeholder: 'agente@carla.gt' }] },
      { id: 'acc-product', method: 'POST', path: '/admin/accounts/{id}/product', description: 'Configura producto y moneda (product) como checking GTQ/USD.', fields: [{ name: 'id', label: 'ID de la cuenta', placeholder: 'account id' }, { name: 'product_type', label: 'Tipo de producto', placeholder: 'checking' }, { name: 'account_currency', label: 'Moneda', placeholder: 'GTQ/USD' }] },
      { id: 'acc-resend-status', method: 'POST', path: '/admin/accounts/{id}/resend-status', description: 'Reenvía status por WhatsApp (resend-status) para mantener al cliente informado.', fields: [{ name: 'id', label: 'ID de la cuenta', placeholder: 'account id' }] },
    ],
  },
  {
    id: 'data',
    label: 'Datos · Limpieza/Seed',
    accent: 'text-teal-200',
    icon: Database,
    summary: 'Reset demo, seeds y limpieza de datos de prueba. Incluye QA banking para validar integraciones.',
    endpoints: [
      { id: 'cleanup-test', method: 'GET', path: '/admin/verifications/cleanup-test-data', description: 'Limpia datos de prueba (cleanup-test-data); opcionalmente borra todo.', fields: [boolField('delete_all', '¿Borrar todo?', false)] },
      { id: 'seed-webhook', method: 'GET', path: '/admin/verifications/seed-webhook-test-user', description: 'Genera usuario fijo de webhook (seed-webhook-test-user) para pruebas.' },
      { id: 'data-cleanup', method: 'POST', path: '/admin/data/cleanup', description: 'Cleanup amplio por scope (test_user, stale_demo, all) en data/cleanup.', fields: [{ name: 'scope', label: 'Ámbito', type: 'select', options: ['test_user', 'stale_demo', 'all'].map((v) => ({ label: v, value: v })) }, boolField('dry_run', 'Modo prueba', true)] },
      { id: 'data-seed', method: 'POST', path: '/admin/data/seed/demo', description: 'Carga escenarios demo (data/seed/demo) para demos rápidas.', fields: [{ name: 'scenario', label: 'Escenario', placeholder: 'default' }] },
      ...qaEndpoints,
    ],
  },
  {
    id: 'conversas',
    label: 'Conversaciones y Mensajes',
    accent: 'text-indigo-200',
    icon: Link2,
    summary: 'Flujos de mensajería y conversaciones para soporte/chat. Útil para inspeccionar mensajería y estados.',
    endpoints: [
      { id: 'conv-list', method: 'GET', path: '/api/v1/conversations', description: 'Lista conversaciones con paginación (conversations).', fields: [{ name: 'page', label: 'Página', type: 'number', inQuery: true }, { name: 'size', label: 'Tamaño', type: 'number', inQuery: true }] },
      { id: 'conv-detail', method: 'GET', path: '/api/v1/conversations/{conversation_id}', description: 'Trae detalle y mensajes de una conversación específica.', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }] },
      { id: 'conv-message', method: 'POST', path: '/api/v1/conversations/{conversation_id}/messages', description: 'Envía respuesta con texto y adjunto opcional a la conversación.', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }, { name: 'message', label: 'Mensagem', placeholder: 'Texto', type: 'textarea' }, { name: 'attachment_url', label: 'Arquivo (URL)', placeholder: 'https://...' }] },
      { id: 'conv-ws', method: 'GET', path: '/api/v1/conversations/ws/{conversation_id}', description: 'Abre stream WebSocket para monitorear mensajes en vivo (ws).', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }] },
    ],
  },
  {
    id: 'kpis',
    label: 'KPIs y Tableros',
    accent: 'text-rose-200',
    icon: Gauge,
    summary: 'Indicadores y dashboards operativos para monitorear salud y performance.',
    endpoints: [
      { id: 'kpis', method: 'GET', path: '/api/v1/dashboard/kpis', description: 'KPIs principales para monitoreo ejecutivo (dashboard kpis).' },
      { id: 'weekly', method: 'GET', path: '/api/v1/dashboard/weekly-activity', description: 'Actividad semanal con cortes por semana (weekly-activity).' },
      { id: 'process-dist', method: 'GET', path: '/api/v1/dashboard/process-distribution', description: 'Distribución de procesos para ver carga (process-distribution).' },
      { id: 'banking-errors', method: 'GET', path: '/admin/dashboard/banking-errors', description: 'Errores bancarios agregados para priorizar fixes (banking-errors).', fields: [{ name: 'limit', label: 'limit', type: 'number', inQuery: true, placeholder: '50' }] },
      { id: 'verification-funnel', method: 'GET', path: '/admin/dashboard/verification-funnel', description: 'Funil OTP/RENAP/DIDIT/QIC (verification-funnel).' },
    ],
  },
  {
    id: 'processes',
    label: 'Procesos',
    accent: 'text-cyan-200',
    icon: Workflow,
    summary: 'Procesos transversales y pipelines internos. Punto de entrada a acciones batch y orquestaciones.',
    endpoints: [
      { id: 'proc-list', method: 'GET', path: '/api/v1/processes', description: 'Lista procesos y permite buscar por nombre (processes).', fields: [{ name: 'q', label: 'Buscar', placeholder: 'nombre', inQuery: true }] },
      { id: 'proc-create', method: 'POST', path: '/api/v1/processes', description: 'Crea proceso con nombre y configuración JSON (processes create).', fields: [{ name: 'name', label: 'Nombre', placeholder: 'Onboarding GT' }, { name: 'config', label: 'Config (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-update', method: 'PATCH', path: '/admin/processes/{id}', description: 'Actualiza metadata/estado (active/draft) y metadata JSON.', fields: [{ name: 'id', label: 'ID del proceso', placeholder: 'id' }, { name: 'state', label: 'Estado', placeholder: 'active/draft' }, { name: 'metadata', label: 'Metadata (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-usage', method: 'GET', path: '/admin/processes/{id}/usage', description: 'Uso y éxito del proceso (usage) para seguimiento.', fields: [{ name: 'id', label: 'ID del proceso', placeholder: 'id' }] },
    ],
  },
  {
    id: 'devqa',
    label: 'Dev y QA',
    accent: 'text-orange-200',
    icon: Wrench,
    summary: 'Herramientas para QA/Dev: toggles, rutas de prueba y fixtures controlados.',
    endpoints: [
      { id: 'dev-renap', method: 'GET', path: '/dev/renap/test', description: 'Prueba RENAP (renap/test) con teléfono para debug.', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' , inQuery: true}] },
      { id: 'dev-health', method: 'GET', path: '/dev/health', description: 'Health de entorno dev (health).' },
      { id: 'dev-config', method: 'GET', path: '/dev/config', description: 'Config dev expuesta (config) para inspección rápida.' },
      ...qaEndpoints,
    ],
  },
  {
    id: 'runner',
    label: 'Runner',
    accent: 'text-lime-200',
    icon: Rocket,
    summary: 'Ejecuciones ad-hoc y tareas rápidas para demos o validaciones puntuales.',
    endpoints: [
      { id: 'runner-presets', method: 'GET', path: '/admin/runner/presets', description: 'Lista presets disponibles (runner/presets).', fields: [] },
      { id: 'runner-execute', method: 'POST', path: '/admin/runner/execute', description: 'Ejecuta preset (simulate/execute) con filtros opcionales.', fields: [{ name: 'preset', label: 'Preset', placeholder: 'banking_full' }, { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: 'uuid' }, { name: 'steps', label: 'Pasos (csv)', placeholder: 'step1,step2' }, { name: 'limit', label: 'Límite', type: 'number', placeholder: '5' }, { name: 'mode', label: 'Modo', type: 'select', options: ['simulate', 'execute'].map((v) => ({ label: v, value: v })) }, boolField('stop_on_error', 'Detener en error', true), boolField('continue_on_error', 'Continuar en error', false) ] },
      { id: 'runner-step', method: 'POST', path: '/admin/runner/step', description: 'Ejecuta un paso único (runner/step) con payload JSON.', fields: [{ name: 'step', label: 'Paso', placeholder: 'nombre' }, { name: 'payload', label: 'Payload (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'runner-history', method: 'GET', path: '/admin/runner/history', description: 'Historial de ejecuciones (runner/history) con límite configurable.', fields: [{ name: 'limit', label: 'Límite', type: 'number', inQuery: true, placeholder: '20' }] },
    ],
  },
  {
    id: 'health',
    label: 'Salud y Flujo',
    accent: 'text-emerald-200',
    icon: Radar,
    summary: 'Visión de salud y flujos principales. Usa estos endpoints para revisar integridad y telemetría.',
    endpoints: [
      { id: 'flow-health', method: 'GET', path: '/flow/health', description: 'Chequea salud del flujo RSA (flow/health).' },
      { id: 'health', method: 'GET', path: '/health', description: 'Health general del servicio (health).' },
    ],
  },
];

const fieldDefault = (field: Field) => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'checkbox') return false;
  return '';
};

const initialForm = (endpoint: Endpoint) =>
  (endpoint.fields || []).reduce<Record<string, any>>((acc, f) => {
    acc[f.name] = fieldDefault(f);
    return acc;
  }, {});

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>(() => initialForm(endpoint));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDanger, setConfirmDanger] = useState(false);
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);

  const flashClass = flash === 'success' ? 'ring-2 ring-emerald-500/40' : flash === 'error' ? 'ring-2 ring-red-500/40' : '';

  const onChange = (field: Field, value: any) => setForm((prev) => ({ ...prev, [field.name]: value }));

  const renderField = (field: Field, inputId: string) => {
    const common = 'w-full rounded-xl border border-border/50 bg-muted/30 dark:bg-card/50 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent focus:border-accent/50';
    if (field.type === 'textarea')
      return (
        <textarea
          id={inputId}
          name={field.name}
          className={`${common} min-h-[80px] font-mono text-xs`}
          placeholder={field.placeholder}
          value={form[field.name] ?? ''}
          onChange={(e) => onChange(field, e.target.value)}
        />
      );
    if (field.type === 'select')
      return (
        <select id={inputId} name={field.name} className={common} value={form[field.name] ?? ''} onChange={(e) => onChange(field, e.target.value)}>
          <option value="">—</option>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    if (field.type === 'checkbox')
      return (
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer" htmlFor={inputId}>
          <input
            id={inputId}
            name={field.name}
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-accent"
            checked={Boolean(form[field.name])}
            onChange={(e) => onChange(field, e.target.checked)}
          />
          {field.label}
        </label>
      );
    return (
      <Input
        id={inputId}
        name={field.name}
        placeholder={field.placeholder}
        type={field.type === 'number' ? 'number' : 'text'}
        className="rounded-xl bg-muted/30 dark:bg-card/50 border-border/50 focus:ring-accent"
        value={form[field.name] ?? ''}
        onChange={(e) => onChange(field, field.type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  const callEndpoint = async () => {
    setLoading(true);
    setError(null);
    setFlash(null);
    try {
      const path = endpoint.path.replace(/{(\w+)}/g, (_, key) => encodeURIComponent(form[key] ?? key));
      let finalUrl = `${API_URL}${path}`.replace(/\/+$/, '').length ? `${API_URL}${path}` : path;
      const queryFields = (endpoint.fields || []).filter((f) => f.inQuery);
      if (queryFields.length) {
        const qs = new URLSearchParams();
        queryFields.forEach((f) => {
          const val = form[f.name];
          if (val !== '' && val !== undefined && val !== null) qs.append(f.name, String(val));
        });
        const q = qs.toString();
        if (q) finalUrl = `${finalUrl}?${q}`;
      }

      const bodyFields = (endpoint.fields || []).filter((f) => !f.inQuery && !endpoint.path.includes(`{${f.name}}`));
      const body: Record<string, any> = {};
      bodyFields.forEach((f) => {
        const val = form[f.name];
        if (val !== '' && val !== undefined) body[f.name] = val;
      });

      const headers: Record<string, string> = { Accept: 'application/json' };
      const autoToken = (import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_CARLA_SERVICIOS_API_KEY || import.meta.env.VITE_CHANNELS_API_KEY || '').trim();
      const stored = typeof window !== 'undefined' ? localStorage.getItem('carla_token') || '' : '';
      const token = autoToken || stored;
      if (token) headers.Authorization = `Bearer ${token}`;

      if (!API_URL) {
        setResult({ note: 'API_URL no configurada', url: finalUrl, body: endpoint.method === 'GET' ? undefined : body });
        toast({ title: 'Simulación offline', description: finalUrl });
        return;
      }

      const res = await fetch(finalUrl, {
        method: endpoint.method,
        headers: { ...headers, ...(endpoint.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}) },
        body: endpoint.method === 'GET' ? undefined : JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(`Error ${res.status}`);
        setResult(json);
        setFlash('error');
        setTimeout(() => setFlash(null), 900);
        toast({ title: 'Error', description: endpoint.description, variant: 'destructive' });
      } else {
        setResult({ status: res.status, data: json });
        setFlash('success');
        setTimeout(() => setFlash(null), 900);
        toast({ title: 'OK', description: endpoint.description });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      setFlash('error');
      setTimeout(() => setFlash(null), 900);
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmDanger(false);
    }
  };

  const handleSubmit = () => {
    if (endpoint.danger && !confirmDanger) {
      setConfirmDanger(true);
      return;
    }
    void callEndpoint();
  };

  return (
    <article className={`bento-card glass-hover flex flex-col gap-4 ${flashClass}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase ${endpoint.method === 'GET' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : endpoint.method === 'POST' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
              {endpoint.method}
            </span>
            {endpoint.danger && <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/15 text-red-600 dark:text-red-400">DANGER</span>}
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">{endpoint.displayTitle || endpoint.description}</p>
          {endpoint.displayTitle && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{endpoint.description}</p>}
        </div>
        <Button
          size="sm"
          variant={endpoint.danger && !confirmDanger ? 'destructive' : 'default'}
          className="shrink-0 h-8 px-3 text-xs"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : confirmDanger ? 'Confirmar' : 'Run'}
        </Button>
      </header>

      {endpoint.fields?.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {endpoint.fields.map((field) => {
            const inputId = `${endpoint.id}-${field.name}`;
            const showLabel = field.type !== 'checkbox';
            return (
              <div key={field.name} className={`space-y-1 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                {showLabel && <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide" htmlFor={inputId}>{field.label}</label>}
                {renderField(field, inputId)}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Sin campos.</p>
      )}

      {error && <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">{error}</div>}

      {result ? (
        <pre className="code-block max-h-48 overflow-auto text-[11px] whitespace-pre-wrap">
          <code dangerouslySetInnerHTML={{
            __html: JSON.stringify(result, null, 2)
              .replace(/(".*?")(?=:)/g, '<span class="text-accent dark:text-cyan-400">$1</span>')
              .replace(/: "(.*?)"/g, ': <span class="text-sky-600 dark:text-cyan-200">"$1"</span>')
              .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600 dark:text-amber-300">$1</span>')
              .replace(/: (true|false|null)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
          }} />
        </pre>
      ) : (
        <div className="rounded-xl bg-muted/30 dark:bg-card/30 border border-border/30 px-3 py-2 text-[11px] text-muted-foreground font-mono">
          // response
        </div>
      )}
    </article>
  );
}

export function PainelControlePage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const activeGroup = endpointGroups.find((group) => group.id === selectedGroupId) ?? null;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl bento-card bg-gradient-to-br from-card via-card to-accent/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.1),transparent_60%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Mission Control</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              Painel<span className="text-accent glow-text">.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Admin endpoints · Verificações · Workers · Banking bridge
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30">
              <span className="status-dot status-dot-ok" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{endpointGroups.length} grupos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Terminal size={14} className="text-accent" />
              <span className="text-sm font-medium text-foreground">{endpointGroups.reduce((acc, g) => acc + g.endpoints.length, 0)} endpoints</span>
            </div>
          </div>
        </div>
      </header>

      {!activeGroup ? (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {endpointGroups.map((group) => (
              <article
                key={group.id}
                className="bento-card glass-hover group cursor-pointer"
                onClick={() => setSelectedGroupId(group.id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <group.icon className={`w-5 h-5 ${group.accent}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground group-hover:text-accent transition-colors">{group.label}</h3>
                    <p className="text-xs text-muted-foreground">{group.endpoints.length} ações</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{group.summary}</p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {/* Group Header */}
          <div className="bento-card flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedGroupId(null)}
                className="w-10 h-10 rounded-xl bg-muted/50 dark:bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <activeGroup.icon className={`w-5 h-5 ${activeGroup.accent}`} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-foreground">{activeGroup.label}</h2>
                  <p className="text-xs text-muted-foreground">{activeGroup.endpoints.length} endpoints disponíveis</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg hidden lg:block">{activeGroup.summary}</p>
          </div>

          {/* Endpoints Grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeGroup.endpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

