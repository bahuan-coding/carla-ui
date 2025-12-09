import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCopy,
  Database,
  FileJson,
  Hash,
  Info,
  Loader2,
  MessageCircle,
  Phone,
  RefreshCw,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  CircleDot,
  ArrowRight,
} from 'lucide-react';
import { isBankError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProcessDetail,
  useProcessRetry,
  useProcessRerun,
  useProcessStatus,
  useProcessesAdmin,
  useBridgeBlacklistQuery,
  useBridgeMicoopeClient,
  useBridgeCreateMicoopeIndividual,
  useBridgeComplementaryDataCreate,
  useBridgeCreateStandardAccount,
  useBridgeUpdateOnboarding,
  useBridgeUpdateComplementaryData,
  useBridgeQueryComplementClient,
} from '@/hooks/use-carla-data';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatPhone, formatRelative, mapStatusDisplay, normalizeAccountForUi, shortId } from '@/lib/utils';
import type { Account } from '@/types/account';

const confirmDanger = (message: string) => window.confirm(message || '¿Continuar?');

type FilterStatus = '' | 'ready_for_bank' | 'bank_processing' | 'bank_retry' | 'bank_rejected';

const STATUS_FILTERS: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  { value: '', label: 'Todos', icon: <CircleDot size={12} /> },
  { value: 'ready_for_bank', label: 'Listo', icon: <CheckCircle2 size={12} /> },
  { value: 'bank_processing', label: 'En proceso', icon: <Loader2 size={12} /> },
  { value: 'bank_retry', label: 'Retry', icon: <Repeat2 size={12} /> },
  { value: 'bank_rejected', label: 'Rechazado', icon: <AlertTriangle size={12} /> },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ok: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  warn: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  info: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-500' },
};

const getInitials = (name: string) => {
  if (!name || name.startsWith('#') || name.startsWith('+')) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

const getAvatarColor = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [bankError, setBankError] = useState<{ key: string; step: string; code: string; message: string; correlationId: string } | null>(null);
  const auditReason = '';
  const auditOperator = 'operador.demo@carla';

  const COOLDOWN_KEY = 'carla_banking_cooldowns';
  const COOLDOWN_DURATION = 10;
  const [cooldowns, setCooldowns] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(COOLDOWN_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  }, [cooldowns]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  const getCooldownRemaining = useCallback((key: string) => {
    const lastTrigger = cooldowns[key];
    if (!lastTrigger) return 0;
    const elapsed = Math.floor((now - lastTrigger) / 1000);
    return Math.max(0, COOLDOWN_DURATION - elapsed);
  }, [cooldowns, now]);

  const triggerCooldown = useCallback((key: string) => {
    setCooldowns((prev) => ({ ...prev, [key]: Date.now() }));
  }, []);

  const filters = useMemo(() => ({ q: search, status, limit: 30 }), [search, status]);
  const listQuery = useProcessesAdmin(filters);
  const detailQuery = useProcessDetail(selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(() => detailQuery.refetch(), 60000);
    return () => clearInterval(interval);
  }, [selectedId, detailQuery]);

  const statusMutation = useProcessStatus(selectedId);
  const retryMutation = useProcessRetry(selectedId);
  const rerunMutation = useProcessRerun(selectedId);
  const bridgeBlacklist = useBridgeBlacklistQuery(selectedId);
  const bridgeMicoopeClient = useBridgeMicoopeClient(selectedId);
  const bridgeCreateIndividual = useBridgeCreateMicoopeIndividual(selectedId);
  const bridgeComplementaryCreate = useBridgeComplementaryDataCreate(selectedId);
  const bridgeCreateAccount = useBridgeCreateStandardAccount(selectedId);
  const bridgeUpdateOnboarding = useBridgeUpdateOnboarding(selectedId);
  const bridgeUpdateComplementary = useBridgeUpdateComplementaryData(selectedId);
  const bridgeQueryComplement = useBridgeQueryComplementClient(selectedId);

  const processes = listQuery.data || [];

  const kpis = useMemo(() => {
    const total = processes.length;
    const active = processes.filter((p) => (p.status || '').toLowerCase().includes('ready') || (p.banking_status || '').includes('processing') || (p.status || '').includes('created')).length;
    const errors = processes.filter((p) => /error|reject|fail/.test((p.status || p.banking_status || p.last_error || '').toLowerCase())).length;
    const retry = processes.filter((p) => /retry/.test((p.status || p.banking_status || '').toLowerCase())).length;
    return { total, active, errors, retry };
  }, [processes]);

  const onActionError = (message: string, error?: unknown, key?: string) => {
    if (isBankError(error)) {
      setBankError({
        key: key || 'unknown',
        step: error.step,
        code: error.detail.error_code,
        message: error.detail.error_message,
        correlationId: error.correlationId,
      });
      return;
    }
    const errMsg = error instanceof Error ? error.message : 'Intente de nuevo.';
    if (key) {
      setBankError({ key, step: 'request', code: 'ERROR', message: errMsg, correlationId: '' });
    } else {
      toast({ variant: 'destructive', title: message, description: errMsg });
    }
  };

  const cards = useMemo(() => processes.map((p) => {
    const account = (p as { account?: Account })?.account;
    const rootPhone = (p as { whatsapp_phone_e164?: string | null }).whatsapp_phone_e164 ?? undefined;
    const phoneVal = rootPhone || (p.phone ?? undefined);
    const normalized = normalizeAccountForUi(account, { id: p.id, phone: phoneVal, name: p.name ?? undefined });
    const statusDisplay = mapStatusDisplay(p.status ?? p.banking_status ?? undefined);
    const verificationDisplay = mapStatusDisplay(p.verification_status ?? undefined);
    const bankingDisplay = mapStatusDisplay(p.banking_status ?? undefined);
    
    // Get document info
    const docType = account?.document_type || '';
    const docNumber = account?.document_number || '';
    const product = account?.product_type || p.product_type || '';
    
    // Build display name - NEVER use phone as title (avoid duplicated data)
    const realName = normalized.fullName || p.name || account?.full_name;
    const title = realName || (docNumber ? `${docType || 'Doc'} ${docNumber}` : `#${shortId(p.id)}`);
    
    return {
      id: p.id,
      title,
      statusDisplay,
      phoneFormatted: formatPhone(normalized.mainPhone || phoneVal),
      hasPhone: Boolean(normalized.mainPhone || phoneVal),
      docType,
      docNumber,
      product,
      attempts: p.attempts ?? 0,
      events: p.events_count ?? 0,
      lastError: p.last_error,
      updated: p.updated_at ?? p.last_error_at ?? p.created_at ?? undefined,
      verificationDisplay,
      bankingDisplay,
      correlationId: p.correlation_id,
    };
  }), [processes]);

  const auditFields = useMemo(() => ({ operator: auditOperator || undefined, reason: auditReason || undefined }), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-xl text-foreground">Procesos</h1>
            <p className="text-xs text-muted-foreground">
              {listQuery.isLoading ? 'Cargando...' : `${processes.length} conversaciones activas`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching}>
            <RefreshCw size={16} className={listQuery.isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      {/* Stats Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'Activos', value: kpis.active, color: 'emerald' },
          { label: 'Errores', value: kpis.errors, color: 'red' },
          { label: 'Retry', value: kpis.retry, color: 'amber' },
          { label: 'Total', value: kpis.total, color: 'slate' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
              stat.color === 'red' ? 'bg-red-500/10 text-red-500' :
              stat.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
              'bg-muted/50 text-foreground'
            }`}
          >
            <span className="font-bold text-lg tabular-nums">{stat.value}</span>
            <span className="text-xs opacity-80">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Buscar conversación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500/50"
            id="process-search"
            name="process-search"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl w-fit">
        {STATUS_FILTERS.map((item) => {
          const isActive = status === item.value;
          return (
            <button
              key={item.value || 'all'}
              onClick={() => setStatus(item.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <span className={isActive ? 'text-emerald-500' : ''}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Conversation List - WhatsApp Style */}
      <div className="rounded-2xl bg-card/50 border border-border/30 overflow-hidden divide-y divide-border/20">
        {listQuery.isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
          : cards.map((card) => {
              const colors = STATUS_COLORS[card.statusDisplay.tone] || STATUS_COLORS.info;
              return (
                <article
                  key={card.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedId(card.id)}
                >
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(card.id)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                    {getInitials(card.title)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${colors.dot} border-2 border-card`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: Name + Time */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm text-foreground truncate">{card.title}</h4>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {card.updated ? formatRelative(card.updated) : ''}
                      </span>
                    </div>

                    {/* Phone number - clean display */}
                    {card.hasPhone && (
                      <p className="text-sm text-muted-foreground font-mono mb-1">{card.phoneFormatted}</p>
                    )}

                    {/* Bottom row: Status + Product */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {card.statusDisplay.label}
                      </span>
                      {card.product && (
                        <span className="text-[11px] text-muted-foreground truncate">{card.product}</span>
                      )}
                      {card.lastError && (
                        <AlertTriangle size={12} className="text-red-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                </article>
              );
            })}
        {listQuery.isError && (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="font-semibold text-foreground mb-1">Error de conexión</p>
            <p className="text-sm text-muted-foreground mb-4">No se pudieron cargar las conversaciones</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => listQuery.refetch()}>
              <RefreshCw size={14} className="mr-2" />
              Reintentar
            </Button>
          </div>
        )}
        {!listQuery.isLoading && !processes.length && !listQuery.isError && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={28} className="text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground mb-1">Sin conversaciones</p>
            <p className="text-sm text-muted-foreground">No hay procesos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => { setSelectedId(open ? selectedId : undefined); if (!open) setBankError(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl bg-background border-l border-border/50">
          <SheetHeader className="pb-3 border-b border-border/30">
            <SheetTitle className="flex items-center gap-2 text-base">
              <ShieldCheck size={18} className="text-accent" />
              Detalle del proceso
            </SheetTitle>
          </SheetHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailQuery.isError ? (
            <div className="py-6">
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center">
                <AlertTriangle size={24} className="mx-auto text-red-500 mb-2" />
                <p className="font-medium text-red-700 dark:text-red-300">Error al cargar</p>
                <p className="text-xs text-red-600/80 mt-1">{selectedId}</p>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => detailQuery.refetch()}>
                <RefreshCw size={14} className={detailQuery.isFetching ? 'animate-spin mr-2' : 'mr-2'} />
                Reintentar
              </Button>
            </div>
          ) : detailQuery.data ? (
            (() => {
              const account = (detailQuery.data?.account || {}) as Account;
              const normalized = normalizeAccountForUi(account, { id: detailQuery.data.id, phone: detailQuery.data.phone ?? undefined, name: detailQuery.data.name ?? undefined });
              const fullName = normalized.fullName || normalized.displayName || '—';
              const mainPhone = formatPhone(normalized.mainPhone);
              const email = normalized.email || '—';
              const complianceSource = normalized.complianceSource;
              const risk = normalized.riskFlags.risk;
              const valueOrDash = (v?: string | number | null) => (v === undefined || v === null || v === '' ? '—' : v);
              const badgeTone = (v?: boolean) => (v ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30');
              const renderField = (label: string, value?: string | number | null, mono?: boolean) => (
                <div className="space-y-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{valueOrDash(value)}</p>
                </div>
              );

              const statusChips = [
                { label: 'DIDIT', value: account.didit_status },
                { label: 'QIC', value: account.qic_status },
                { label: 'RENAP', value: account.renap_status },
                { label: 'Teléfono', value: account.phone_verification_status },
              ];

              const chipTone = (val?: string) => {
                const v = (val || '').toLowerCase();
                if (/approved|verified|ok|success|clear/.test(v)) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
                if (/error|fail|reject/.test(v)) return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
                return 'bg-muted/50 text-muted-foreground border-border/50';
              };

              const bankClientId = account.external_customer_id || account.bank_partner_client_id || account.external_account_id || account.id;
              const phoneForBank = normalized.mainPhone || account.phone_main || undefined;

              return (
                <div className="space-y-4 py-4 text-sm">
                  {/* Identity Card */}
                  <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <User size={18} className="text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[180px]">
                            {detailQuery.data.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => detailQuery.data?.id && navigator.clipboard.writeText(detailQuery.data.id)}
                          >
                            <ClipboardCopy size={10} />
                          </Button>
                        </div>
                        <h3 className="font-semibold text-foreground">{fullName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone size={11} className="text-accent/70" /> {mainPhone}</span>
                          {email !== '—' && <span className="truncate">{email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/30">
                      {renderField('Documento', `${account.document_type || '—'} ${account.document_number || ''}`, true)}
                      {renderField('País', account.document_country)}
                      {renderField('Producto', account.product_type)}
                      {renderField('Moneda', account.account_currency)}
                      {renderField('Canal', account.channel)}
                      {renderField('Institución', account.institution_name)}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30">
                      {statusChips.map((chip) => (
                        <span key={chip.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${chipTone(chip.value as string)}`}>
                          {chip.label}: {valueOrDash(chip.value)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="flex w-full p-0.5 bg-muted/30 rounded-lg border border-border/30">
                      <TabsTrigger value="resumen" className="flex-1 flex items-center justify-center gap-1 rounded text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Info size={12} /> Resumen</TabsTrigger>
                      <TabsTrigger value="verificaciones" className="flex-1 flex items-center justify-center gap-1 rounded text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShieldCheck size={12} /> Verificación</TabsTrigger>
                      <TabsTrigger value="banco" className="flex-1 flex items-center justify-center gap-1 rounded text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><Building2 size={12} /> Banco</TabsTrigger>
                      <TabsTrigger value="raw" className="flex-1 flex items-center justify-center gap-1 rounded text-xs py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"><FileJson size={12} /> JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="pt-3">
                      <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {renderField('Nombre completo', fullName)}
                          {renderField('Teléfono', mainPhone, true)}
                          {renderField('Email', email)}
                          {renderField('Documento', normalized.documentLabel, true)}
                          {renderField('Dirección', normalized.address)}
                          {renderField('Tipo vivienda', normalized.housingType)}
                          {renderField('Nacionalidad', normalized.nationality)}
                          {renderField('Estado civil', normalized.maritalStatus)}
                          {renderField('Empleo', normalized.employmentStatus)}
                          {renderField('Empleador', normalized.employer)}
                          {renderField('Ingreso mensual', normalized.monthlyIncome ? `Q${normalized.monthlyIncome.toLocaleString()}` : null)}
                          {renderField('Egreso mensual', normalized.monthlyExpenses ? `Q${normalized.monthlyExpenses.toLocaleString()}` : null)}
                          {renderField('Creado', formatDate(account.created_at))}
                          {renderField('Actualizado', formatDate(detailQuery.data.updated_at))}
                        </div>
                        <div className="pt-3 border-t border-border/30">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Flags de riesgo</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${badgeTone(account.is_pep)}`}>PEP: {account.is_pep ? 'Sí' : 'No'}</span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${badgeTone(account.is_pep_related)}`}>Rel PEP: {account.is_pep_related ? 'Sí' : 'No'}</span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${badgeTone(account.has_us_tax_obligations)}`}>US Tax: {account.has_us_tax_obligations ? 'Sí' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="verificaciones" className="pt-3">
                      <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {renderField('DIDIT', account.didit_status)}
                          {renderField('Último check DIDIT', formatDate(account.didit_last_check))}
                          {renderField('Decisión DIDIT', account.didit_metadata?.decision?.status)}
                          {renderField('Motivo DIDIT', account.didit_metadata?.decision?.reason)}
                          {renderField('RENAP', account.renap_status)}
                          {renderField('Último check RENAP', formatDate(account.renap_last_check))}
                          {renderField('Teléfono verificación', account.phone_verification_status)}
                          {renderField('OTP verificado', formatDate(account.phone_verification_metadata?.verified_at))}
                          {renderField('Compliance', complianceSource.join(', '))}
                        </div>
                        {risk && (
                          <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-200 flex items-center gap-2">
                            <AlertTriangle size={14} />
                            Riesgo identificado (PEP/Compliance). Revisar manualmente.
                          </div>
                        )}
                        {account.didit_verification_link && (
                          <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.open(account.didit_verification_link || '#', '_blank')}>
                            Abrir verificación DIDIT
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="banco" className="pt-3">
                      {(() => {
                        const isSuccessResponse = (resp: unknown) => {
                          const raw = (resp as { status?: unknown })?.status ?? (resp as { statusCode?: unknown })?.statusCode ?? (resp as { code?: unknown })?.code;
                          const numeric = typeof raw === 'string' ? Number(raw) : (raw as number | undefined);
                          if (numeric === 200 || numeric === 201) return true;
                          const text = typeof raw === 'string' ? raw.toLowerCase() : '';
                          return text.includes('200') || text === 'ok' || text === 'created' || text.includes('201');
                        };
                        const resolveStatus = (finishedAt?: string | null, resp?: unknown) => {
                          if (isSuccessResponse(resp) || finishedAt) return { tone: 'ok', label: `OK${finishedAt ? ` · ${formatDate(finishedAt)}` : ''}`, done: true };
                          if (resp) return { tone: 'error', label: 'Fallo', done: false };
                          return { tone: 'warn', label: 'Pendiente', done: false };
                        };
                        const formatBirthDate = (date?: string | null) => {
                          if (!date) return '';
                          const digits = date.replace(/\D/g, '').slice(0, 8);
                          return digits.length === 8 ? digits : '';
                        };
                        const mutateWithError = <T,>(mutation: { mutate: (args: T, opts?: { onError?: (e: unknown) => void; onSuccess?: () => void }) => void }, args: T, label: string, key: string) => {
                          mutation.mutate(args, {
                            onError: (e) => onActionError(`Fallo ${label}`, e, key),
                            onSuccess: () => { toast({ title: `${label} OK` }); detailQuery.refetch(); },
                          });
                        };
                        const endpointRows = [
                          { key: 'blacklist', label: 'Blacklist', finishedAt: account.bank_blacklist_finished_at, resp: account.bank_blacklist_response, action: () => mutateWithError(bridgeBlacklist, { dpi: account.document_number, C75000: account.document_type || '11', C75016: `D${(account.document_number || '').replace(/^D/i, '')}`, C75804: '', C75020: '', C75503: account.document_country || 'GT', C75043: account.document_country || 'GT', C75084: formatBirthDate(account.birth_date) }, 'Blacklist', 'blacklist'), pending: bridgeBlacklist.isPending, needsClient: false },
                          { key: 'onboarding', label: 'Onboarding', finishedAt: account.bank_onboarding_finished_at, resp: account.bank_onboarding_response, action: () => mutateWithError(bridgeUpdateOnboarding, { clientId: bankClientId ?? '', body: { email: account.email, phone: phoneForBank, full_name: account.full_name } }, 'Onboarding', 'onboarding'), pending: bridgeUpdateOnboarding.isPending, needsClient: true },
                          { key: 'account', label: 'Cuenta', finishedAt: account.bank_account_finished_at, resp: account.bank_account_response, action: () => mutateWithError(bridgeCreateAccount, { clientId: bankClientId ?? '', body: { currency: account.account_currency, product: account.product_type, phone: phoneForBank } }, 'Cuenta', 'account'), pending: bridgeCreateAccount.isPending, needsClient: true },
                          { key: 'complementary', label: 'Complementary', finishedAt: account.bank_complementary_finished_at, resp: account.bank_complementary_response, action: () => mutateWithError(bridgeComplementaryCreate, { clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, 'Complementary', 'complementary'), pending: bridgeComplementaryCreate.isPending, needsClient: true },
                          { key: 'complement_query', label: 'Query Complement', finishedAt: account.bank_complement_query_finished_at, resp: account.bank_complement_query_response, action: () => mutateWithError(bridgeQueryComplement, bankClientId ?? '', 'Query Complement', 'complement_query'), pending: bridgeQueryComplement.isPending, needsClient: true },
                          { key: 'complement_update', label: 'Update Complement', finishedAt: account.bank_complementary_update_finished_at, resp: account.bank_complementary_update_response, action: () => mutateWithError(bridgeUpdateComplementary, { clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, 'Update Complement', 'complement_update'), pending: bridgeUpdateComplementary.isPending, needsClient: true },
                          { key: 'cliente', label: 'Consulta Micoope', finishedAt: account.bank_client_finished_at, resp: account.bank_client_response, action: () => mutateWithError(bridgeMicoopeClient, bankClientId ?? '', 'Consulta Micoope', 'cliente'), pending: bridgeMicoopeClient.isPending, needsClient: true },
                          { key: 'crear_cliente', label: 'Crear Individual', finishedAt: account.bank_client_finished_at, resp: account.bank_client_response, action: () => mutateWithError(bridgeCreateIndividual, { clientId: bankClientId ?? '', document_number: account.document_number, full_name: account.full_name, phone: phoneForBank } as never, 'Crear Individual', 'crear_cliente'), pending: bridgeCreateIndividual.isPending, needsClient: true },
                        ];
                        return (
                          <div className="space-y-3 rounded-xl bg-muted/30 border border-border/50 p-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border/30">
                              <div>
                                <p className="text-xs text-muted-foreground">{valueOrDash(account.institution_name)}</p>
                                <p className="font-mono text-[11px] text-muted-foreground">{valueOrDash(bankClientId)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] text-accent">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                  Auto 60s
                                </span>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => detailQuery.refetch()} disabled={detailQuery.isFetching}>
                                  <RefreshCw size={12} className={detailQuery.isFetching ? 'animate-spin' : ''} />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Espere 10s entre disparos del mismo servicio.</p>
                            <div className="grid gap-2">
                              {endpointRows.map((ep) => {
                                const st = resolveStatus(ep.finishedAt, ep.resp);
                                const cooldownKey = `${selectedId}_${ep.key}`;
                                const cooldownRemaining = getCooldownRemaining(cooldownKey);
                                const isOnCooldown = cooldownRemaining > 0;
                                const disabled = st.done || ep.pending || isOnCooldown || (ep.needsClient && !bankClientId);
                                const hasError = bankError?.key === ep.key;
                                return (
                                  <div key={ep.key} className="space-y-0">
                                    <div className={`flex items-center justify-between gap-2 rounded-lg bg-background/50 border px-3 py-2 transition-all ${hasError ? 'border-red-500/50 bg-red-500/5' : isOnCooldown ? 'border-amber-500/40' : st.done ? 'border-emerald-500/30' : 'border-border/50'}`}>
                                      <div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                          <span className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-red-500' : st.done ? 'bg-emerald-500' : isOnCooldown ? 'bg-amber-500' : ep.pending ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground'}`} />
                                          {ep.label}
                                        </div>
                                        <span className={`text-[10px] ${hasError ? 'text-red-600 dark:text-red-400' : st.tone === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : st.tone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                          {hasError ? 'Error' : st.label}
                                        </span>
                                      </div>
                                      <Button size="sm" variant={hasError ? 'destructive' : isOnCooldown ? 'secondary' : 'outline'} disabled={disabled} className="h-7 min-w-[70px] text-xs" onClick={() => { triggerCooldown(cooldownKey); setBankError(null); ep.action(); }}>
                                        {st.done ? 'OK' : ep.pending ? <RefreshCw size={12} className="animate-spin" /> : isOnCooldown ? <span className="font-mono">{formatCooldown(cooldownRemaining)}</span> : 'Disparar'}
                                      </Button>
                                    </div>
                                    {hasError && (
                                      <div className="mx-1 -mt-1 rounded-b-lg bg-gradient-to-b from-red-500/20 to-red-500/5 border border-t-0 border-red-500/30 px-3 py-2.5 backdrop-blur-sm">
                                        <div className="flex items-start gap-2">
                                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                            <AlertTriangle size={12} className="text-red-400" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-[10px] font-bold text-red-300 tracking-wide">{bankError.code}</span>
                                              <button onClick={() => setBankError(null)} className="ml-auto text-red-400/60 hover:text-red-300 text-sm leading-none">×</button>
                                            </div>
                                            <p className="text-[11px] text-red-200/90 mt-1.5 leading-relaxed">{bankError.message}</p>
                                            {bankError.correlationId && (
                                              <p className="text-[9px] font-mono text-red-400/50 mt-1.5 flex items-center gap-1">
                                                <Hash size={9} />
                                                {bankError.correlationId}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="raw" className="pt-3">
                      <div className="space-y-3">
                        <details className="group rounded-xl border border-border/50 bg-muted/30 overflow-hidden" open>
                          <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                            <Database size={12} className="text-accent" />
                            Account
                          </summary>
                          <pre className="max-h-64 overflow-auto px-4 py-3 border-t border-border/30 text-[10px] font-mono bg-black/5 dark:bg-black/30">
                            <code dangerouslySetInnerHTML={{
                              __html: JSON.stringify(account, null, 2)
                                .replace(/(".*?")(?=:)/g, '<span class="text-accent dark:text-cyan-400">$1</span>')
                                .replace(/: "(.*?)"/g, ': <span class="text-sky-600 dark:text-cyan-200">"$1"</span>')
                                .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600 dark:text-amber-300">$1</span>')
                                .replace(/: (true|false|null)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
                            }} />
                          </pre>
                        </details>
                        {account.extra_data && (
                          <details className="group rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
                            <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                              <FileJson size={12} className="text-accent" />
                              Extra data
                            </summary>
                            <pre className="max-h-64 overflow-auto px-4 py-3 border-t border-border/30 text-[10px] font-mono bg-black/5 dark:bg-black/30">
                              <code dangerouslySetInnerHTML={{
                                __html: JSON.stringify(account.extra_data, null, 2)
                                  .replace(/(".*?")(?=:)/g, '<span class="text-accent dark:text-cyan-400">$1</span>')
                                  .replace(/: "(.*?)"/g, ': <span class="text-sky-600 dark:text-cyan-200">"$1"</span>')
                                  .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600 dark:text-amber-300">$1</span>')
                                  .replace(/: (true|false|null)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
                              }} />
                            </pre>
                          </details>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Actions Panel - Consolidated */}
                  <div className="rounded-xl bg-muted/30 border border-border/50 p-4 mt-4">
                    <p className="text-xs font-medium text-foreground mb-3">Acciones rápidas</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={retryMutation.isPending}
                        onClick={() => {
                          if (!confirmDanger('Recolocar en retry?')) return;
                          retryMutation.mutate(
                            { ...auditFields },
                            { onError: (er) => onActionError('Fallo retry', er), onSuccess: () => toast({ title: 'Retry enviado' }) },
                          );
                        }}
                      >
                        <Repeat2 size={12} className="mr-1" /> Retry
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={rerunMutation.isPending}
                        onClick={() => {
                          if (!confirmDanger('Rerun incluye eventos. ¿Continuar?')) return;
                          rerunMutation.mutate(
                            { include_events: true, ...auditFields },
                            { onError: (er) => onActionError('Fallo rerun', er), onSuccess: () => toast({ title: 'Rerun disparado' }) },
                          );
                        }}
                      >
                        <Sparkles size={12} className="mr-1" /> Rerun
                      </Button>
                      {[
                        { value: 'ready_for_bank', label: 'Listo' },
                        { value: 'bank_processing', label: 'Procesando' },
                        { value: 'bank_retry', label: 'Retry' },
                        { value: 'bank_rejected', label: 'Rechazado' },
                        { value: 'account_created', label: 'Creada' },
                      ].map((s) => (
                        <Button
                          key={s.value}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          disabled={statusMutation.isPending}
                          onClick={() => {
                            if (!confirmDanger(`Forzar estado "${s.label}"?`)) return;
                            statusMutation.mutate(
                              { status: s.value, ...auditFields },
                              { onError: (e) => onActionError('Fallo al forzar estado', e), onSuccess: () => toast({ title: 'Estado ajustado', description: s.label }) },
                            );
                          }}
                        >
                          → {s.label}
                        </Button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Retry = reintentar worker. Rerun = rehacer eventos.</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Database size={32} className="mx-auto mb-3 opacity-40" />
              <p>Seleccione un proceso</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
