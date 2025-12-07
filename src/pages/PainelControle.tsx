import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BadgeCheck, Database, Gauge, Layers, Link2, ListChecks, Radar, RefreshCw, Rocket, Server, ShieldCheck, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const qaEndpoints = ['blacklist', 'client', 'complementary', 'account', 'onboarding-update', 'complementary-update', 'complement-query'].map((slug) => ({
  id: `qa-${slug}`,
  method: 'POST',
  path: `/admin/qa/banking/${slug}`,
  description: `QA banking · ${slug.replace('-', ' ')}`,
  fields: [
    { name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' },
    boolField('dry_run', 'dry_run', true),
    { name: 'payload', label: 'payload (JSON)', type: 'textarea', placeholder: '{...}' },
  ],
  tags: ['dry_run'],
  danger: false,
}));

const workerRunFields = [
  { name: 'batch_size', label: 'batch_size', type: 'number', placeholder: '50' },
  { name: 'max_retries', label: 'max_retries', type: 'number', placeholder: '3' },
  { name: 'limit_ids', label: 'limit_ids (csv)', placeholder: 'id1,id2' },
];

const endpointGroups: Group[] = [
  {
    id: 'verifications',
    label: 'Verificações',
    accent: 'text-emerald-300',
    icon: ShieldCheck,
    endpoints: [
      { id: 'ver-stats', method: 'GET', path: '/admin/verifications/stats', description: 'Contagens por status' },
      { id: 'ver-stuck', method: 'GET', path: '/admin/verifications/stuck', description: 'Pendências acima do limiar', fields: [{ name: 'hours', label: 'hours', type: 'number', placeholder: '24', inQuery: true }] },
      { id: 'ver-approve', method: 'POST', path: '/admin/verifications/{account_opening_id}/approve-manual', description: 'Força QIC approved', fields: [{ name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }, { name: 'operator', label: 'operator', placeholder: 'email' }, { name: 'reason', label: 'reason', placeholder: 'Justificativa' }], danger: true },
      { id: 'ver-reject', method: 'POST', path: '/admin/verifications/{account_opening_id}/reject-manual', description: 'Força QIC rejected', fields: [{ name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }, { name: 'reason', label: 'reason', placeholder: 'Motivo' }, { name: 'operator', label: 'operator', placeholder: 'email' }], danger: true },
      { id: 'ver-status-phone', method: 'GET', path: '/admin/verifications/status/{phone}', description: 'Status por telefone', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' }] },
      { id: 'ver-status-timeline', method: 'GET', path: '/admin/verifications/{account_opening_id}/verify/status', description: 'Timeline completa', fields: [{ name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }] },
      { id: 'ver-renap', method: 'POST', path: '/admin/verifications/{account_opening_id}/verify/renap', description: 'Gatilho manual RENAP', fields: [{ name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }] },
      { id: 'ver-phone-campaign', method: 'POST', path: '/admin/verifications/phone-campaign/trigger', description: 'Dispara campanha OTP', fields: [{ name: 'batch_size', label: 'batch_size', type: 'number', placeholder: '50' }, { name: 'exclude_recent_hours', label: 'exclude_recent_hours', type: 'number', placeholder: '24' }] },
      { id: 'ver-otp-resend', method: 'POST', path: '/admin/verifications/otp/resend', description: 'Reenvia OTP', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' }, { name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }] },
      { id: 'ver-otp-override', method: 'POST', path: '/admin/verifications/otp/mark-verified', description: 'Override OTP', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' }, { name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }, { name: 'operator', label: 'operator', placeholder: 'email' }, { name: 'reason', label: 'reason', placeholder: 'Justificativa' }], danger: true },
      { id: 'ver-didit-regenerate', method: 'POST', path: '/admin/verifications/{id}/didit/regenerate', description: 'Novo link DIDIT', fields: [{ name: 'id', label: 'id', placeholder: 'verification id' }] },
      { id: 'ver-didit-override', method: 'POST', path: '/admin/verifications/{id}/didit/override', description: 'Override DIDIT status', fields: [{ name: 'id', label: 'id', placeholder: 'verification id' }, { name: 'status', label: 'status', type: 'select', options: ['approved', 'rejected', 'pending', 'error'].map((v) => ({ label: v, value: v })) }, { name: 'note', label: 'note', placeholder: 'Observação' }] },
    ],
  },
  {
    id: 'banking',
    label: 'Banking & Onboarding',
    accent: 'text-sky-300',
    icon: Database,
    endpoints: [
      { id: 'bank-poller', method: 'GET', path: '/admin/banking/client-poller', description: 'Roda worker sequencial', fields: [{ name: 'limit', label: 'limit', type: 'number', placeholder: '50', inQuery: true }, boolField('include_events', 'include_events', true) ] },
      { id: 'bank-ready', method: 'GET', path: '/account-openings/ready-for-bank', description: 'Backlog pronto para banco', fields: [{ name: 'limit', label: 'limit', type: 'number', placeholder: '50', inQuery: true }] },
      { id: 'bank-status', method: 'POST', path: '/admin/banking/{id}/status', description: 'Força status bancário', fields: [{ name: 'id', label: 'id', placeholder: 'banking id' }, { name: 'status', label: 'status', type: 'select', options: ['ready_for_bank', 'bank_queued', 'bank_processing', 'bank_retry', 'bank_rejected', 'account_created'].map((v) => ({ label: v, value: v })) }, { name: 'reason', label: 'reason', placeholder: 'Justificativa' }], danger: true },
      { id: 'bank-retry', method: 'POST', path: '/admin/banking/{id}/retry', description: 'Coloca em bank_retry', fields: [{ name: 'id', label: 'id', placeholder: 'banking id' }] },
      { id: 'bank-payload', method: 'POST', path: '/admin/banking/{id}/payload/save', description: 'Anexa payloads request/response', fields: [{ name: 'id', label: 'id', placeholder: 'banking id' }, { name: 'request_payload', label: 'request_payload', type: 'textarea', placeholder: '{...}' }, { name: 'response_payload', label: 'response_payload', type: 'textarea', placeholder: '{...}' }] },
      { id: 'bank-events', method: 'GET', path: '/admin/banking/events/{id}', description: 'Timeline banking_events', fields: [{ name: 'id', label: 'id', placeholder: 'banking id' }] },
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
      { id: 'worker-pause', method: 'POST', path: '/admin/workers/pause', description: 'Pausa worker', fields: [{ name: 'worker', label: 'worker', placeholder: 'account-openings|phone-campaign|banking' }, { name: 'reason', label: 'reason', placeholder: 'Por quê?' }] },
      { id: 'worker-resume', method: 'POST', path: '/admin/workers/resume', description: 'Resume worker', fields: [{ name: 'worker', label: 'worker', placeholder: 'account-openings|phone-campaign|banking' }, { name: 'reason', label: 'reason', placeholder: 'Por quê?' }] },
      { id: 'worker-status', method: 'GET', path: '/admin/workers/status', description: 'Locks e último run' },
    ],
  },
  {
    id: 'accounts',
    label: 'Account Openings',
    accent: 'text-purple-300',
    icon: Layers,
    endpoints: [
      { id: 'ao-by-id', method: 'GET', path: '/account-openings/{id}', description: 'Busca por id', fields: [{ name: 'id', label: 'id', placeholder: 'uuid' }] },
      { id: 'ao-by-phone', method: 'GET', path: '/account-openings/by-phone', description: 'Busca por telefone', fields: [{ name: 'phone', label: 'phone', placeholder: '+502...' , inQuery: true}] },
      { id: 'ao-by-document', method: 'GET', path: '/account-openings/by-document', description: 'Busca por documento', fields: [{ name: 'document', label: 'document', placeholder: 'CPF/CUI', inQuery: true }] },
      { id: 'ao-trigger-worker', method: 'POST', path: '/account-openings/trigger-worker', description: 'Aciona worker manual', fields: [{ name: 'account_opening_id', label: 'account_opening_id', placeholder: 'uuid' }], danger: true },
      { id: 'ao-status-phone', method: 'GET', path: '/account-openings/status/{phone_number}', description: 'Helper verificação', fields: [{ name: 'phone_number', label: 'phone_number', placeholder: '+502...' }] },
      { id: 'acc-tags', method: 'POST', path: '/admin/accounts/{id}/tags', description: 'Add/Remove tags', fields: [{ name: 'id', label: 'id', placeholder: 'account id' }, { name: 'action', label: 'action', type: 'select', options: ['add', 'remove'].map((v) => ({ label: v, value: v })) }, { name: 'tags', label: 'tags (csv)', placeholder: 'vip,aml' }] },
      { id: 'acc-note', method: 'POST', path: '/admin/accounts/{id}/note', description: 'Anotar conta', fields: [{ name: 'id', label: 'id', placeholder: 'account id' }, { name: 'note', label: 'note', placeholder: 'Observação', type: 'textarea' }] },
      { id: 'acc-assign', method: 'POST', path: '/admin/accounts/{id}/assign', description: 'Atribuir owner/agent', fields: [{ name: 'id', label: 'id', placeholder: 'account id' }, { name: 'owner', label: 'owner/agent', placeholder: 'email' }] },
      { id: 'acc-product', method: 'POST', path: '/admin/accounts/{id}/product', description: 'Ajustar produto/currency', fields: [{ name: 'id', label: 'id', placeholder: 'account id' }, { name: 'product_type', label: 'product_type', placeholder: 'checking' }, { name: 'account_currency', label: 'account_currency', placeholder: 'GTQ/USD' }] },
      { id: 'acc-resend-status', method: 'POST', path: '/admin/accounts/{id}/resend-status', description: 'Reenviar mensagem status', fields: [{ name: 'id', label: 'id', placeholder: 'account id' }] },
    ],
  },
  {
    id: 'data',
    label: 'Dados · Cleanup/Seed',
    accent: 'text-teal-200',
    icon: Database,
    endpoints: [
      { id: 'cleanup-test', method: 'GET', path: '/admin/verifications/cleanup-test-data', description: 'Limpa test user/all', fields: [boolField('delete_all', 'delete_all', false)] },
      { id: 'seed-webhook', method: 'GET', path: '/admin/verifications/seed-webhook-test-user', description: 'Seed usuário fixo webhook' },
      { id: 'data-cleanup', method: 'POST', path: '/admin/data/cleanup', description: 'Cleanup amplo', fields: [{ name: 'scope', label: 'scope', type: 'select', options: ['test_user', 'stale_demo', 'all'].map((v) => ({ label: v, value: v })) }, boolField('dry_run', 'dry_run', true)] },
      { id: 'data-seed', method: 'POST', path: '/admin/data/seed/demo', description: 'Popula cenários demo', fields: [{ name: 'scenario', label: 'scenario', placeholder: 'default' }] },
      ...qaEndpoints,
    ],
  },
  {
    id: 'conversas',
    label: 'Conversas & Mensagens',
    accent: 'text-indigo-200',
    icon: Link2,
    endpoints: [
      { id: 'conv-list', method: 'GET', path: '/api/v1/conversations', description: 'Lista conversas', fields: [{ name: 'page', label: 'page', type: 'number', inQuery: true }, { name: 'size', label: 'size', type: 'number', inQuery: true }] },
      { id: 'conv-detail', method: 'GET', path: '/api/v1/conversations/{conversation_id}', description: 'Detalhe + mensagens', fields: [{ name: 'conversation_id', label: 'conversation_id', placeholder: 'id' }] },
      { id: 'conv-message', method: 'POST', path: '/api/v1/conversations/{conversation_id}/messages', description: 'Envia outbound', fields: [{ name: 'conversation_id', label: 'conversation_id', placeholder: 'id' }, { name: 'message', label: 'message', placeholder: 'Texto', type: 'textarea' }, { name: 'attachment_url', label: 'attachment_url', placeholder: 'https://...' }] },
      { id: 'conv-ws', method: 'GET', path: '/api/v1/conversations/ws/{conversation_id}', description: 'Stream WS', fields: [{ name: 'conversation_id', label: 'conversation_id', placeholder: 'id' }] },
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
      { id: 'proc-list', method: 'GET', path: '/api/v1/processes', description: 'Lista processos', fields: [{ name: 'q', label: 'q', placeholder: 'search', inQuery: true }] },
      { id: 'proc-create', method: 'POST', path: '/api/v1/processes', description: 'Cria processo', fields: [{ name: 'name', label: 'name', placeholder: 'Nome' }, { name: 'config', label: 'config (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-update', method: 'PATCH', path: '/admin/processes/{id}', description: 'Atualiza metadata/estado', fields: [{ name: 'id', label: 'id', placeholder: 'process id' }, { name: 'state', label: 'state', placeholder: 'active/draft' }, { name: 'metadata', label: 'metadata (JSON)', type: 'textarea', placeholder: '{...}' }] },
      { id: 'proc-usage', method: 'GET', path: '/admin/processes/{id}/usage', description: 'Runs e taxa de sucesso', fields: [{ name: 'id', label: 'id', placeholder: 'process id' }] },
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

const defaultHeaders = ['Authorization: Bearer <CHANNELS_API_KEY>', 'Idempotency-Key', 'X-Correlation-ID', 'X-Request-ID', 'X-Execution-Time-MS'];

const fieldDefault = (field: Field) => {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'checkbox') return false;
  return '';
};

const initialForm = (endpoint: Endpoint) =>
  (endpoint.fields || []).reduce<Record<string, any>>((acc, f) => {
    acc[f.name] = fieldDefault(f);
    return acc;
  }, { authToken: '' });

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
      if (form.authToken) headers.Authorization = `Bearer ${form.authToken}`;
      if (form.idempotencyKey) headers['Idempotency-Key'] = form.idempotencyKey;
      if (form.correlationId) headers['X-Correlation-ID'] = form.correlationId;
      if (form.requestId) headers['X-Request-ID'] = form.requestId;

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
        toast({ title: `Falha ${endpoint.id}`, description: `Status ${res.status}`, variant: 'destructive' });
      } else {
        setResult({ status: res.status, data: json });
        toast({ title: 'OK', description: endpoint.id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      toast({ title: 'Erro', description: error || 'Falha ao chamar endpoint', variant: 'destructive' });
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
    <Card className="glass border-border/60 bg-surface">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className={`${methodTone[endpoint.method]} text-[11px]`}>{endpoint.method}</Badge>
            <Badge variant="outline" className="text-[11px] border-border/50 text-foreground/70">
              {endpoint.path}
            </Badge>
            {endpoint.danger ? <Badge variant="destructive" className="text-[11px]">Destrutivo</Badge> : null}
          </div>
          <p className="text-sm text-foreground/80">{endpoint.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Bearer token (opcional)" value={form.authToken || ''} onChange={(e) => setForm((p) => ({ ...p, authToken: e.target.value }))} className="w-44" />
          <Button size="sm" variant={endpoint.danger && !confirmDanger ? 'destructive' : 'default'} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Rodando…' : confirmDanger ? 'Confirmar' : 'Executar'}
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
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Idempotency-Key" value={form.idempotencyKey || ''} onChange={(e) => setForm((p) => ({ ...p, idempotencyKey: e.target.value }))} />
          <Input placeholder="X-Correlation-ID" value={form.correlationId || ''} onChange={(e) => setForm((p) => ({ ...p, correlationId: e.target.value }))} />
          <Input placeholder="X-Request-ID" value={form.requestId || ''} onChange={(e) => setForm((p) => ({ ...p, requestId: e.target.value }))} />
        </div>
        {error ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        {result ? (
          <pre className="max-h-72 overflow-auto rounded-lg border border-border/40 bg-background/70 px-3 py-2 text-[12px] text-foreground/80 whitespace-pre-wrap">{formatValue(result)}</pre>
        ) : (
          <p className="text-[11px] text-foreground/60">Saída aparecerá aqui.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PainelControlePage() {
  const accentCards = useMemo(
    () => [
      { icon: Activity, title: 'Observabilidade', body: 'Headers recomendados e idempotência', tone: 'text-emerald-200', items: defaultHeaders },
      { icon: AlertTriangle, title: 'Dry-run por padrão', body: 'Ative force/delete_all apenas quando necessário', tone: 'text-amber-200', items: ['dry_run=true em ações destrutivas', 'Confirmação dupla para overrides'] },
      { icon: BadgeCheck, title: 'Audit', body: 'Envie operator + reason em mutações', tone: 'text-sky-200', items: ['operator', 'reason', 'before/after logs'] },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/40 bg-surface px-4 py-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Mission Control · Admin API</p>
          <h1 className="text-2xl font-semibold text-foreground">Painel de Controle Carla Channels</h1>
          <p className="text-sm text-foreground/70">Cockpit rápido para OTP, RENAP, DIDIT, banking e bots WhatsApp.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] border-emerald-400/40 text-emerald-200">
            Live
          </Badge>
          <Button variant="outline" size="sm" className="text-xs">
            <RefreshCw size={14} className="mr-1" /> Sync manual
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {accentCards.map((card) => (
          <Card key={card.title} className="glass border-border/60 bg-surface">
            <CardHeader className="flex items-center gap-2">
              <card.icon className={`h-5 w-5 ${card.tone}`} />
              <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-foreground/70">{card.body}</p>
              <div className="flex flex-wrap gap-1">
                {card.items.map((item: string) => (
                  <Badge key={item} variant="outline" className="text-[11px] border-border/50 text-foreground/70">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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
                <p className="text-xs text-foreground/60">Endpoints deste domínio, com campos essenciais.</p>
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

      <Card className="glass border-border/60 bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4 text-accent" />
            Resumo rápido de headers e observabilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Header</TableHead>
                <TableHead>Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultHeaders.map((h) => (
                <TableRow key={h}>
                  <TableCell className="font-medium">{h}</TableCell>
                  <TableCell className="text-xs text-foreground/70">Tracing, idempotência e auditoria</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

