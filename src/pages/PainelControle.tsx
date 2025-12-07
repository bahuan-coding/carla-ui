import { useState } from 'react';
import { Database, Gauge, Layers, Link2, Radar, RefreshCw, Rocket, Server, ShieldCheck, Workflow, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  fields?: Field[];
  tags?: string[];
  danger?: boolean;
};

type Group = {
  id: string;
  label: string;
  accent: string;
  icon: any;
  endpoints: Endpoint[];
};

const boolField = (name: string, label: string, def = true): Field => ({ name, label, type: 'checkbox', defaultValue: def });

const qaEndpoints: Endpoint[] = ['blacklist', 'client', 'complementary', 'account', 'onboarding-update', 'complementary-update', 'complement-query'].map((slug) => ({
  id: `qa-${slug}`,
  method: 'POST' as const,
  path: `/admin/qa/banking/${slug}`,
  description: `QA banking · ${slug.replace('-', ' ')}`,
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
    label: 'Verificações',
    accent: 'text-emerald-300',
    icon: ShieldCheck,
    endpoints: [
      { id: 'ver-stats', method: 'GET', path: '/admin/verifications/stats', description: 'Totales por estado' },
      {
        id: 'ver-stuck',
        method: 'GET',
        path: '/admin/verifications/stuck',
        description: 'Pendentes acima do limite de horas',
        fields: [{ name: 'hours', label: 'Horas pendente', type: 'number', placeholder: '24', inQuery: true }],
      },
      {
        id: 'ver-approve',
        method: 'POST',
        path: '/admin/verifications/{account_opening_id}/approve-manual',
        description: 'Aprovar verificação (forçado)',
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
        description: 'Rechazar verificação (forçado)',
        fields: [
          { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
          { name: 'reason', label: 'Motivo', placeholder: 'Por que rechazar' },
          { name: 'operator', label: 'Operador (correo)', placeholder: 'agente@carla.gt' },
        ],
        danger: true,
      },
      { id: 'ver-status-phone', method: 'GET', path: '/admin/verifications/status/{phone}', description: 'Estado por teléfono', fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502 55 55 55 55' }] },
      { id: 'ver-status-timeline', method: 'GET', path: '/admin/verifications/{account_opening_id}/verify/status', description: 'Timeline completa', fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }] },
      { id: 'ver-renap', method: 'POST', path: '/admin/verifications/{account_opening_id}/verify/renap', description: 'Forçar RENAP', fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }] },
      {
        id: 'ver-phone-campaign',
        method: 'POST',
        path: '/admin/verifications/phone-campaign/trigger',
        description: 'Disparar campanha OTP',
        fields: [
          { name: 'batch_size', label: 'Tamanho do lote', type: 'number', placeholder: '50' },
          { name: 'exclude_recent_hours', label: 'Ignorar últimos (h)', type: 'number', placeholder: '24' },
        ],
      },
      { id: 'ver-otp-resend', method: 'POST', path: '/admin/verifications/otp/resend', description: 'Reenviar OTP', fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...' }, { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }] },
      {
        id: 'ver-otp-override',
        method: 'POST',
        path: '/admin/verifications/otp/mark-verified',
        description: 'Marcar OTP verificado',
        fields: [
          { name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...' },
          { name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' },
          { name: 'operator', label: 'Operador (correo)', placeholder: 'agente@carla.gt' },
          { name: 'reason', label: 'Motivo', placeholder: 'Justificación' },
        ],
        danger: true,
      },
      { id: 'ver-didit-regenerate', method: 'POST', path: '/admin/verifications/{id}/didit/regenerate', description: 'Gerar novo link DIDIT', fields: [{ name: 'id', label: 'ID de verificação', placeholder: 'verif id' }] },
      {
        id: 'ver-didit-override',
        method: 'POST',
        path: '/admin/verifications/{id}/didit/override',
        description: 'Ajustar status DIDIT',
        fields: [
          { name: 'id', label: 'ID de verificação', placeholder: 'verif id' },
          { name: 'status', label: 'Status', type: 'select', options: ['approved', 'rejected', 'pending', 'error'].map((v) => ({ label: v, value: v })) },
          { name: 'note', label: 'Nota', placeholder: 'Observação curta' },
        ],
      },
    ],
  },
  {
    id: 'banking',
    label: 'Banking & Onboarding',
    accent: 'text-sky-300',
    icon: Database,
    endpoints: [
      { id: 'bank-poller', method: 'GET', path: '/admin/banking/client-poller', description: 'Executar fila bancária', fields: [{ name: 'limit', label: 'Límite', type: 'number', placeholder: '50', inQuery: true }, boolField('include_events', 'Ver timeline', true)] },
      { id: 'bank-ready', method: 'GET', path: '/account-openings/ready-for-bank', description: 'Clientes prontos para banco', fields: [{ name: 'limit', label: 'Límite', type: 'number', placeholder: '50', inQuery: true }] },
      {
        id: 'bank-status',
        method: 'POST',
        path: '/admin/banking/{id}/status',
        description: 'Forçar status bancário',
        fields: [
          { name: 'id', label: 'ID bancário', placeholder: 'id banco' },
          { name: 'status', label: 'Status', type: 'select', options: ['ready_for_bank', 'bank_queued', 'bank_processing', 'bank_retry', 'bank_rejected', 'account_created'].map((v) => ({ label: v, value: v })) },
          { name: 'reason', label: 'Motivo', placeholder: 'Por que alterar' },
        ],
        danger: true,
      },
      { id: 'bank-retry', method: 'POST', path: '/admin/banking/{id}/retry', description: 'Mover para retry', fields: [{ name: 'id', label: 'ID bancário', placeholder: 'id banco' }] },
      {
        id: 'bank-payload',
        method: 'POST',
        path: '/admin/banking/{id}/payload/save',
        description: 'Salvar payloads request/response',
        fields: [
          { name: 'id', label: 'ID bancário', placeholder: 'id banco' },
          { name: 'request_payload', label: 'Request (JSON)', type: 'textarea', placeholder: '{...}' },
          { name: 'response_payload', label: 'Response (JSON)', type: 'textarea', placeholder: '{...}' },
        ],
      },
      { id: 'bank-events', method: 'GET', path: '/admin/banking/events/{id}', description: 'Timeline banking', fields: [{ name: 'id', label: 'ID bancário', placeholder: 'id banco' }] },
    ],
  },
  {
    id: 'workers',
    label: 'Workers & Cron',
    accent: 'text-amber-300',
    icon: Server,
    endpoints: [
      { id: 'cron-account-openings', method: 'GET', path: '/cron/account-openings', description: 'Cron worker banco' },
      { id: 'cron-phone-campaign', method: 'GET', path: '/cron/phone-verification-campaign', description: 'Cron campanha OTP' },
      { id: 'worker-account-openings', method: 'POST', path: '/admin/workers/account-openings/run', description: 'Run account openings', fields: workerRunFields },
      { id: 'worker-phone-campaign', method: 'POST', path: '/admin/workers/phone-campaign/run', description: 'Run phone campaign', fields: workerRunFields },
      { id: 'worker-banking', method: 'POST', path: '/admin/workers/banking/run', description: 'Run banking worker', fields: [{ name: 'limit', label: 'limit', type: 'number', placeholder: '50' }, boolField('include_events', 'include_events', true)] },
      { id: 'worker-pause', method: 'POST', path: '/admin/workers/pause', description: 'Pausar worker', fields: [{ name: 'worker', label: 'Nome do worker', placeholder: 'account-openings' }, { name: 'reason', label: 'Motivo', placeholder: 'Por quê?' }] },
      { id: 'worker-resume', method: 'POST', path: '/admin/workers/resume', description: 'Retomar worker', fields: [{ name: 'worker', label: 'Nome do worker', placeholder: 'account-openings' }, { name: 'reason', label: 'Motivo', placeholder: 'Por quê?' }] },
      { id: 'worker-status', method: 'GET', path: '/admin/workers/status', description: 'Locks e último run' },
    ],
  },
  {
    id: 'accounts',
    label: 'Account Openings',
    accent: 'text-purple-300',
    icon: Layers,
    endpoints: [
      { id: 'ao-by-id', method: 'GET', path: '/account-openings/{id}', description: 'Buscar por ID', fields: [{ name: 'id', label: 'ID de apertura', placeholder: 'uuid' }] },
      { id: 'ao-by-phone', method: 'GET', path: '/account-openings/by-phone', description: 'Buscar por teléfono', fields: [{ name: 'phone', label: 'Teléfono (+502)', placeholder: '+502...' , inQuery: true}] },
      { id: 'ao-by-document', method: 'GET', path: '/account-openings/by-document', description: 'Buscar por documento', fields: [{ name: 'document', label: 'Documento (DPI)', placeholder: 'DPI', inQuery: true }] },
      { id: 'ao-trigger-worker', method: 'POST', path: '/account-openings/trigger-worker', description: 'Acionar worker manual', fields: [{ name: 'account_opening_id', label: 'ID de apertura (UUID)', placeholder: '8a2c-...' }], danger: true },
      { id: 'ao-status-phone', method: 'GET', path: '/account-openings/status/{phone_number}', description: 'Ayuda de verificación', fields: [{ name: 'phone_number', label: 'Teléfono (+502)', placeholder: '+502...' }] },
      { id: 'acc-tags', method: 'POST', path: '/admin/accounts/{id}/tags', description: 'Tags da conta', fields: [{ name: 'id', label: 'ID da conta', placeholder: 'account id' }, { name: 'action', label: 'Ação', type: 'select', options: ['add', 'remove'].map((v) => ({ label: v, value: v })) }, { name: 'tags', label: 'Tags (coma)', placeholder: 'vip,aml' }] },
      { id: 'acc-note', method: 'POST', path: '/admin/accounts/{id}/note', description: 'Adicionar nota', fields: [{ name: 'id', label: 'ID da conta', placeholder: 'account id' }, { name: 'note', label: 'Nota', placeholder: 'Observação', type: 'textarea' }] },
      { id: 'acc-assign', method: 'POST', path: '/admin/accounts/{id}/assign', description: 'Atribuir responsável', fields: [{ name: 'id', label: 'ID da conta', placeholder: 'account id' }, { name: 'owner', label: 'Responsável (email)', placeholder: 'agente@carla.gt' }] },
      { id: 'acc-product', method: 'POST', path: '/admin/accounts/{id}/product', description: 'Produto e moeda', fields: [{ name: 'id', label: 'ID da conta', placeholder: 'account id' }, { name: 'product_type', label: 'Tipo de produto', placeholder: 'checking' }, { name: 'account_currency', label: 'Moeda', placeholder: 'GTQ/USD' }] },
      { id: 'acc-resend-status', method: 'POST', path: '/admin/accounts/{id}/resend-status', description: 'Reenviar status por WhatsApp', fields: [{ name: 'id', label: 'ID da conta', placeholder: 'account id' }] },
    ],
  },
  {
    id: 'data',
    label: 'Dados · Cleanup/Seed',
    accent: 'text-teal-200',
    icon: Database,
    endpoints: [
      { id: 'cleanup-test', method: 'GET', path: '/admin/verifications/cleanup-test-data', description: 'Limpa usuário de teste/all', fields: [boolField('delete_all', 'Apagar tudo?', false)] },
      { id: 'seed-webhook', method: 'GET', path: '/admin/verifications/seed-webhook-test-user', description: 'Seed usuário fixo webhook' },
      { id: 'data-cleanup', method: 'POST', path: '/admin/data/cleanup', description: 'Cleanup amplo', fields: [{ name: 'scope', label: 'Escopo', type: 'select', options: ['test_user', 'stale_demo', 'all'].map((v) => ({ label: v, value: v })) }, boolField('dry_run', 'Modo prova', true)] },
      { id: 'data-seed', method: 'POST', path: '/admin/data/seed/demo', description: 'Popular cenários demo', fields: [{ name: 'scenario', label: 'Cenário', placeholder: 'default' }] },
      ...qaEndpoints,
    ],
  },
  {
    id: 'conversas',
    label: 'Conversas & Mensagens',
    accent: 'text-indigo-200',
    icon: Link2,
    endpoints: [
      { id: 'conv-list', method: 'GET', path: '/api/v1/conversations', description: 'Lista conversas', fields: [{ name: 'page', label: 'Página', type: 'number', inQuery: true }, { name: 'size', label: 'Tamanho', type: 'number', inQuery: true }] },
      { id: 'conv-detail', method: 'GET', path: '/api/v1/conversations/{conversation_id}', description: 'Detalhe + mensagens', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }] },
      { id: 'conv-message', method: 'POST', path: '/api/v1/conversations/{conversation_id}/messages', description: 'Enviar resposta', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }, { name: 'message', label: 'Mensagem', placeholder: 'Texto', type: 'textarea' }, { name: 'attachment_url', label: 'Arquivo (URL)', placeholder: 'https://...' }] },
      { id: 'conv-ws', method: 'GET', path: '/api/v1/conversations/ws/{conversation_id}', description: 'Stream WS', fields: [{ name: 'conversation_id', label: 'ID da conversa', placeholder: 'id' }] },
    ],
  },
  {
    id: 'kpis',
    label: 'Dashboard & KPIs',
    accent: 'text-rose-200',
    icon: Gauge,
    endpoints: [
      { id: 'kpis', method: 'GET', path: '/api/v1/dashboard/kpis', description: 'KPIs core' },
      { id: 'weekly', method: 'GET', path: '/api/v1/dashboard/weekly-activity', description: 'Atividade semanal' },
      { id: 'process-dist', method: 'GET', path: '/api/v1/dashboard/process-distribution', description: 'Distribuição de processos' },
      { id: 'banking-errors', method: 'GET', path: '/admin/dashboard/banking-errors', description: 'Agregados erros banking', fields: [{ name: 'limit', label: 'limit', type: 'number', inQuery: true, placeholder: '50' }] },
      { id: 'verification-funnel', method: 'GET', path: '/admin/dashboard/verification-funnel', description: 'Funil OTP/RENAP/DIDIT/QIC' },
    ],
  },
  {
    id: 'processes',
    label: 'Processos',
    accent: 'text-cyan-200',
    icon: Workflow,
    endpoints: [
      { id: 'proc-list', method: 'GET', path: '/api/v1/processes', description: 'Lista processos', fields: [{ name: 'q', label: 'Buscar', placeholder: 'nome', inQuery: true }] },
      { id: 'proc-create', method: 'POST', path: '/api/v1/processes', description: 'Criar processo', fields: [{ name: 'name', label: 'Nome', placeholder: 'Onboarding GT' }, { name: 'config', label: 'Config (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-update', method: 'PATCH', path: '/admin/processes/{id}', description: 'Atualizar metadata/estado', fields: [{ name: 'id', label: 'ID do processo', placeholder: 'id' }, { name: 'state', label: 'Estado', placeholder: 'active/draft' }, { name: 'metadata', label: 'Metadata (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-usage', method: 'GET', path: '/admin/processes/{id}/usage', description: 'Uso e sucesso', fields: [{ name: 'id', label: 'ID do processo', placeholder: 'id' }] },
    ],
  },
  {
    id: 'devqa',
    label: 'Dev & QA',
    accent: 'text-orange-200',
    icon: Wrench,
    endpoints: [
      { id: 'dev-renap', method: 'GET', path: '/dev/renap/test', description: 'Teste RENAP', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' , inQuery: true}] },
      { id: 'dev-health', method: 'GET', path: '/dev/health', description: 'Health dev' },
      { id: 'dev-config', method: 'GET', path: '/dev/config', description: 'Config dev' },
      ...qaEndpoints,
    ],
  },
  {
    id: 'runner',
    label: 'Runner',
    accent: 'text-lime-200',
    icon: Rocket,
    endpoints: [
      { id: 'runner-presets', method: 'GET', path: '/admin/runner/presets', description: 'Presets disponíveis' },
      { id: 'runner-execute', method: 'POST', path: '/admin/runner/execute', description: 'Executa preset', fields: [{ name: 'preset', label: 'preset', placeholder: 'banking_full' }, { name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }, { name: 'steps', label: 'steps (csv)', placeholder: 'step1,step2' }, { name: 'limit', label: 'limit', type: 'number', placeholder: '5' }, { name: 'mode', label: 'mode', type: 'select', options: ['simulate', 'execute'].map((v) => ({ label: v, value: v })) }, boolField('stop_on_error', 'stop_on_error', true), boolField('continue_on_error', 'continue_on_error', false) ] },
      { id: 'runner-step', method: 'POST', path: '/admin/runner/step', description: 'Executa passo único', fields: [{ name: 'step', label: 'step', placeholder: 'nome' }, { name: 'payload', label: 'payload (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'runner-history', method: 'GET', path: '/admin/runner/history', description: 'Histórico de execuções', fields: [{ name: 'limit', label: 'limit', type: 'number', inQuery: true, placeholder: '20' }] },
    ],
  },
  {
    id: 'health',
    label: 'Health & Flow',
    accent: 'text-emerald-200',
    icon: Radar,
    endpoints: [
      { id: 'flow-health', method: 'GET', path: '/flow/health', description: 'RSA/flow' },
      { id: 'health', method: 'GET', path: '/health', description: 'Health geral' },
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

const formatValue = (val: any) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
};

const methodTone: Record<string, string> = { GET: 'bg-emerald-500/10 text-emerald-200', POST: 'bg-sky-500/10 text-sky-200', PATCH: 'bg-amber-500/10 text-amber-200' };

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, any>>(() => initialForm(endpoint));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDanger, setConfirmDanger] = useState(false);
  const [flash, setFlash] = useState<'success' | 'error' | null>(null);

  const flashStyle =
    flash === 'success'
      ? { boxShadow: '0 0 0 2px rgba(34,197,94,0.35)', backgroundColor: 'rgba(34,197,94,0.07)' }
      : flash === 'error'
        ? { boxShadow: '0 0 0 2px rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.07)' }
        : undefined;

  const onChange = (field: Field, value: any) => setForm((prev) => ({ ...prev, [field.name]: value }));

  const renderField = (field: Field) => {
    const common = 'w-full rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent';
    if (field.type === 'textarea')
      return <textarea className={`${common} min-h-[96px]`} placeholder={field.placeholder} value={form[field.name] ?? ''} onChange={(e) => onChange(field, e.target.value)} />;
    if (field.type === 'select')
      return (
        <select className={common} value={form[field.name] ?? ''} onChange={(e) => onChange(field, e.target.value)}>
          <option value="">—</option>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    if (field.type === 'checkbox')
      return (
        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input type="checkbox" className="h-4 w-4 accent-accent" checked={Boolean(form[field.name])} onChange={(e) => onChange(field, e.target.checked)} />
          {field.label}
        </label>
      );
    return <Input placeholder={field.placeholder} type={field.type === 'number' ? 'number' : 'text'} value={form[field.name] ?? ''} onChange={(e) => onChange(field, field.type === 'number' ? Number(e.target.value) : e.target.value)} />;
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
      const autoToken = (import.meta.env.VITE_API_TOKEN || '').trim();
      const stored = typeof window !== 'undefined' ? localStorage.getItem('carla_token') || '' : '';
      const token = autoToken || stored;
      if (token) headers.Authorization = `Bearer ${token}`;

      if (!API_URL) {
        setResult({ note: 'API_URL não configurado; resposta simulada', url: finalUrl, body: endpoint.method === 'GET' ? undefined : body });
        toast({ title: 'Simulação offline', description: finalUrl });
        return;
      }

      const res = await fetch(finalUrl, {
        method: endpoint.method,
        headers: { ...headers, ...(endpoint.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}) },
        body: endpoint.method === 'GET' ? undefined : JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(`Erro ${res.status}`);
        setResult(json);
        setFlash('error');
        setTimeout(() => setFlash(null), 900);
        toast({ title: 'Erro ao executar', description: endpoint.description, variant: 'destructive' });
      } else {
        setResult({ status: res.status, data: json });
        setFlash('success');
        setTimeout(() => setFlash(null), 900);
        toast({ title: 'Feito', description: endpoint.description });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setFlash('error');
      setTimeout(() => setFlash(null), 900);
      toast({ title: 'Erro', description: 'Falha ao chamar endpoint', variant: 'destructive' });
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
    <Card className="glass border-border/60 bg-surface transition-all" style={flashStyle}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className={`${methodTone[endpoint.method]} text-[11px]`}>{endpoint.method}</Badge>
            {endpoint.danger ? <Badge variant="destructive" className="text-[11px]">Ação sensível</Badge> : null}
          </div>
          <p className="text-sm font-semibold text-foreground">{endpoint.description}</p>
          <p className="text-xs text-foreground/50">{endpoint.path}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={endpoint.danger && !confirmDanger ? 'destructive' : 'default'} className="shadow-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Rodando…' : confirmDanger ? 'Confirmar' : 'Ejecutar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {endpoint.fields?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {endpoint.fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/70">{field.label}</span>
                  {field.inQuery ? <Badge variant="outline" className="text-[10px] border-border/50">query</Badge> : null}
                </div>
                {renderField(field)}
                {field.helper ? <p className="text-[11px] text-foreground/50">{field.helper}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-foreground/60">Sem campos adicionais.</p>
        )}
        {error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        {result ? (
          <pre className="max-h-72 overflow-auto rounded-lg border border-border/40 bg-background/70 px-3 py-2 text-[12px] text-foreground/80 whitespace-pre-wrap">{formatValue(result)}</pre>
        ) : (
          <p className="text-[11px] text-foreground/60">A resposta aparecerá aqui.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PainelControlePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/40 bg-surface px-4 py-4">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Mission Control · GT</p>
          <h1 className="text-2xl font-semibold text-foreground">Panel de Control Carla</h1>
          <p className="text-sm text-foreground/70">Acciones rápidas para verificaciones, banca e bots WhatsApp.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          <RefreshCw size={14} className="mr-1" /> Actualizar lista
        </Button>
      </div>

      <Tabs defaultValue={endpointGroups[0].id} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 bg-background/40">
          {endpointGroups.map((group) => (
            <TabsTrigger key={group.id} value={group.id} className="flex items-center gap-2">
              <group.icon className={`h-4 w-4 ${group.accent}`} />
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {endpointGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                <p className="text-xs text-foreground/60">Ações deste domínio, só o essencial.</p>
              </div>
              <Badge variant="outline" className="text-[11px] border-border/50 text-foreground/70">
                {group.endpoints.length} endpoints
              </Badge>
            </div>
            <div className="grid gap-4">
              {group.endpoints.map((endpoint) => (
                <EndpointCard key={endpoint.id} endpoint={endpoint} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

