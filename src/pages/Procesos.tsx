import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  ClipboardCopy,
  Clock4,
  Database,
  FileJson,
  Info,
  Link2,
  Phone,
  RefreshCw,
  Repeat2,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { API_URL, isBankError } from '@/lib/api';
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
import { formatDate, formatRelative, mapStatusDisplay, maskPhone, normalizeAccountForUi, shortId, toneBadge } from '@/lib/utils';
import type { Account } from '@/types/account';

const confirmDanger = (message: string) => window.confirm(message || '¿Continuar?');

// Extracts error payload from API errors for inline display in bank step rows
const extractBankStepErrorPayload = (error: unknown): unknown => {
  // Handle structured BankError type (502 with BANK_ERROR code)
  if (isBankError(error)) {
    return {
      status: 'error',
      step: error.step,
      error: error.detail.error_message,
      correlation_id: error.correlationId,
      can_retry: error.canRetry,
      finished_at: error.detail.finished_at,
    };
  }
  
  // Handle generic errors with payload attached by api.ts
  const e = error as { payload?: unknown };
  if (e?.payload) return e.payload;
  
  // Fallback: create error object from Error message
  if (error instanceof Error) {
    return { status: 'error', error: error.message, step: 'unknown' };
  }
  
  return { status: 'error', error: 'Error desconocido', step: 'unknown' };
};

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [activeResponseTab, setActiveResponseTab] = useState('');
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
  const resolvedBaseUrl = API_URL;
  const resolvedToken = (import.meta.env.VITE_API_TOKEN || import.meta.env.VITE_CARLA_SERVICIOS_API_KEY || import.meta.env.VITE_CHANNELS_API_KEY || '').trim();

  const kpis = useMemo(() => {
    const total = processes.length;
    const active = processes.filter((p) => (p.status || '').toLowerCase().includes('ready') || (p.banking_status || '').includes('processing') || (p.status || '').includes('created')).length;
    const errors = processes.filter((p) => /error|reject|fail/.test((p.status || p.banking_status || p.last_error || '').toLowerCase())).length;
    const retry = processes.filter((p) => /retry/.test((p.status || p.banking_status || '').toLowerCase())).length;
    return { total, active, errors, retry };
  }, [processes]);

  // Local state to track manually triggered bank step results (success OR error)
  const [localBankResults, setLocalBankResults] = useState<Record<string, { data: unknown; isError: boolean }>>({});

  // Clear local bank results when switching to a different process
  useEffect(() => {
    setLocalBankResults({});
  }, [selectedId]);

  const saveBankStepResult = useCallback((stepKey: string, data: unknown, isError: boolean) => {
    setLocalBankResults((prev) => ({ ...prev, [stepKey]: { data, isError } }));
  }, []);

  // Generic error handler for non-bank-step actions (still uses toast)
  const onActionError = useCallback((message: string, error?: unknown) => {
    toast({ variant: 'destructive', title: message, description: error instanceof Error ? error.message : 'Intente de nuevo.' });
  }, [toast]);

  const cards = processes.map((p) => {
    const account = (p as { account?: Account })?.account;
    const rootPhone = (p as { whatsapp_phone_e164?: string | null }).whatsapp_phone_e164 ?? undefined;
    const phoneVal = rootPhone || (p.phone ?? undefined);
    const normalized = normalizeAccountForUi(account, { id: p.id, phone: phoneVal, name: p.name ?? undefined });
    const displayName = normalized.displayName || maskPhone(phoneVal) || shortId(p.id);
    const statusDisplay = mapStatusDisplay(p.status ?? p.banking_status ?? undefined);
    const verificationDisplay = mapStatusDisplay(p.verification_status ?? undefined);
    const bankingDisplay = mapStatusDisplay(p.banking_status ?? undefined);
    return {
      id: p.id,
      title: displayName,
      rawId: p.id,
      statusDisplay,
      phone: normalized.mainPhone || phoneVal,
      attempts: p.attempts,
      events: p.events_count,
      lastError: p.last_error,
      updated: p.updated_at ?? p.last_error_at ?? p.created_at ?? undefined,
      verificationDisplay,
      bankingDisplay,
    };
  });

  const auditFields = useMemo(() => ({ operator: auditOperator || undefined, reason: auditReason || undefined }), []);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl bento-card bg-gradient-to-br from-card via-card to-accent/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.1),transparent_60%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Mission Control</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              Procesos<span className="text-accent glow-text">.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              WhatsApp onboarding flows · Banking integration · Real-time status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30">
              <span className="status-dot status-dot-ok" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Live</span>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => listQuery.refetch()}>
              <RefreshCw size={18} className={listQuery.isFetching ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </header>

      {/* KPIs Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Activos', value: kpis.active, tone: 'ok' as const },
          { label: 'Errores', value: kpis.errors, tone: kpis.errors ? 'error' as const : 'ok' as const },
          { label: 'Retry', value: kpis.retry, tone: kpis.retry ? 'warn' as const : 'ok' as const },
          { label: 'Total', value: kpis.total, tone: 'ok' as const },
        ].map((kpi) => (
          <div key={kpi.label} className="bento-card glass-hover group">
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-dot ${kpi.tone === 'error' ? 'status-dot-error' : kpi.tone === 'warn' ? 'status-dot-warn' : 'status-dot-ok'}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className="font-display text-3xl text-foreground group-hover:text-accent transition-colors">{kpi.value}</p>
          </div>
        ))}
      </section>

      {(!resolvedBaseUrl || !resolvedToken) && (
        <div className="bento-card border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
          <p className="font-semibold text-amber-700 dark:text-amber-200">Configuración de entorno faltante</p>
          <p className="text-sm text-amber-600 dark:text-amber-300/80 mt-1">
            Defina `VITE_API_URL` y un token API. Sin esto, Procesos no carga.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por teléfono, id o estado"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
          id="process-search"
          name="process-search"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: '', label: 'Todos' },
            { value: 'ready_for_bank', label: 'Listo' },
            { value: 'bank_processing', label: 'Procesando' },
            { value: 'bank_retry', label: 'Retry' },
            { value: 'bank_rejected', label: 'Rechazado' },
          ].map((item) => (
            <Button
              key={item.value || 'all'}
              variant={status === item.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(item.value)}
              className="text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Process Cards */}
        <section className="bento-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">Procesos</h2>
                <p className="text-xs text-muted-foreground">{processes.length} en tiempo real</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {listQuery.isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
              : cards.map((card) => (
                  <article
                    key={card.id}
                    className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 hover:border-accent/40 transition-all cursor-pointer hover:shadow-lg hover:shadow-accent/5"
                    onClick={() => setSelectedId(card.id)}
                  >
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone size={14} className="text-accent shrink-0" />
                          <span className="font-mono text-sm text-foreground truncate">{maskPhone(card.phone)}</span>
                        </div>
                        <h4 className="text-base font-semibold text-foreground truncate">{card.title}</h4>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${toneBadge(card.statusDisplay.tone)}`}>
                        {card.statusDisplay.label}
                      </span>
                    </header>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck size={14} className="text-emerald-500" />
                        <span className="text-muted-foreground">{card.verificationDisplay.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Database size={14} className="text-amber-500" />
                        <span className="text-muted-foreground">{card.bankingDisplay.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock4 size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{card.updated ? formatRelative(card.updated) : '—'}</span>
                      </div>
                    </div>

                    {card.lastError ? (
                      <p className="rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                        {card.lastError.slice(0, 100)}
                      </p>
                    ) : (
                      <p className="rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                        Flujo OK
                      </p>
                    )}

                    <footer className="mt-auto flex items-center gap-2 pt-3 border-t border-border/30">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        disabled={retryMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirmDanger('Recolocar en retry?')) return;
                          retryMutation.mutate(
                            { ...auditFields },
                            { onError: (er) => onActionError('Fallo retry', er), onSuccess: () => toast({ title: 'Retry enviado' }) },
                          );
                        }}
                      >
                        <Repeat2 size={14} className="mr-1" /> Retry
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        disabled={rerunMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirmDanger('Rerun incluye eventos. ¿Continuar?')) return;
                          rerunMutation.mutate(
                            { include_events: true, ...auditFields },
                            { onError: (er) => onActionError('Fallo rerun', er), onSuccess: () => toast({ title: 'Rerun disparado' }) },
                          );
                        }}
                      >
                        <Sparkles size={14} className="mr-1" /> Rerun
                      </Button>
                    </footer>
                  </article>
                ))}
            {listQuery.isError && (
              <div className="col-span-full bento-card border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300">
                No se pudieron cargar procesos.
              </div>
            )}
            {!listQuery.isLoading && !processes.length && (
              <div className="col-span-full text-center py-8 text-muted-foreground">Sin procesos para este filtro.</div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bento-card h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Acciones</h2>
              <p className="text-xs text-muted-foreground">Force status changes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 dark:bg-card/50 border border-border/50">
              <p className="font-semibold text-foreground text-sm">Forzar estado</p>
              <p className="text-xs text-muted-foreground mt-1">Seleccione un proceso primero.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { value: 'ready_for_bank', label: 'Listo' },
                  { value: 'bank_processing', label: 'Procesando' },
                  { value: 'bank_retry', label: 'Retry' },
                  { value: 'bank_rejected', label: 'Rechazado' },
                  { value: 'account_created', label: 'Creada' },
                ].map((s) => (
                  <Button
                    key={s.value}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={!selectedId || statusMutation.isPending}
                    onClick={() => {
                      if (!confirmDanger(`Forzar estado "${s.label}"?`)) return;
                      statusMutation.mutate(
                        { status: s.value, ...auditFields },
                        { onError: (e) => onActionError('Fallo al forzar estado', e), onSuccess: () => toast({ title: 'Estado ajustado', description: s.label }) },
                      );
                    }}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              Retry reintentar worker. Rerun rehacer eventos.
            </p>
          </div>
        </section>
      </div>

      {/* Detail Sheet */}
      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => setSelectedId(open ? selectedId : undefined)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl bg-background/95 backdrop-blur-xl border-l border-border/50">
          <SheetHeader className="pb-4 border-b border-border/30">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-accent" />
              </div>
              <span className="font-display text-lg">Detalle del proceso</span>
            </SheetTitle>
          </SheetHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-3 py-6">
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : detailQuery.isError ? (
            <div className="py-6 space-y-4">
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
                <p className="font-semibold text-red-700 dark:text-red-300">Error al cargar proceso</p>
                <p className="text-sm text-red-600/80 dark:text-red-300/70 mt-1">
                  API retornó error. Verifique credenciales o intente más tarde.
                </p>
                <code className="block mt-2 text-xs font-mono text-red-600/70 dark:text-red-400/60 truncate">
                  {selectedId}
                </code>
              </div>
              <Button variant="outline" size="sm" onClick={() => detailQuery.refetch()} disabled={detailQuery.isFetching}>
                <RefreshCw size={14} className={detailQuery.isFetching ? 'animate-spin mr-2' : 'mr-2'} />
                Reintentar
              </Button>
            </div>
          ) : detailQuery.data ? (
            (() => {
              const account = (detailQuery.data?.account || {}) as Account;
              const normalized = normalizeAccountForUi(account, { id: detailQuery.data.id, phone: detailQuery.data.phone ?? undefined, name: detailQuery.data.name ?? undefined });
              const fullName = normalized.fullName || normalized.displayName || '—';
              const mainPhone = normalized.mainPhone || '—';
              const email = normalized.email || '—';
              const complianceSource = normalized.complianceSource;
              const risk = normalized.riskFlags.risk;
              const valueOrDash = (v?: string | number | null) => (v === undefined || v === null || v === '' ? '—' : v);
              const badgeTone = (v?: boolean) => (v ? 'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30');
              const renderField = (label: string, value?: string | number | null) => (
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-sm text-foreground font-medium">{valueOrDash(value)}</p>
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
                if (/approved|verified|ok|success/.test(v)) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
                if (/error|fail|reject/.test(v)) return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
                return 'bg-muted/50 text-muted-foreground border-border/50';
              };

              return (
                <div className="space-y-4 py-4 text-sm">
                  {/* Header Card */}
                  <div className="rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 dark:bg-black/30 px-2 py-1 rounded-md truncate max-w-[200px]">
                            {detailQuery.data.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => detailQuery.data?.id && navigator.clipboard.writeText(detailQuery.data.id)}
                          >
                            <ClipboardCopy size={12} />
                          </Button>
                        </div>
                        <h3 className="font-display text-lg text-foreground">{fullName}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-accent/70" /> {mainPhone}</span>
                          {email !== '—' && <span className="truncate">{email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                      {statusChips.map((chip) => (
                        <span key={chip.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${chipTone(chip.value as string)}`}>
                          {chip.label}: {valueOrDash(chip.value)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="flex w-full p-1 bg-muted/30 dark:bg-card/50 rounded-xl border border-border/30">
                      <TabsTrigger value="resumen" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"><Info size={13} /> Resumen</TabsTrigger>
                      <TabsTrigger value="verificaciones" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"><ShieldCheck size={13} /> Verificaciones</TabsTrigger>
                      <TabsTrigger value="banco" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"><Building2 size={13} /> Banco</TabsTrigger>
                      <TabsTrigger value="raw" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"><FileJson size={13} /> Debug</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="pt-4">
                      <div className="rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {renderField('Nombre', fullName)}
                          {renderField('Teléfono', mainPhone)}
                          {renderField('Email', email)}
                          {renderField('Documento', normalized.documentLabel)}
                          {renderField('Producto', account.product_type)}
                          {renderField('Moneda', account.account_currency)}
                          {renderField('Canal', account.channel)}
                          {renderField('Estado', account.status)}
                          {renderField('Creado', formatDate(account.created_at))}
                          {renderField('Actualizado', formatDate(detailQuery.data.updated_at))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/30">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3">Flags de riesgo</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${badgeTone(account.is_pep)}`}>PEP: {account.is_pep ? 'Sí' : 'No'}</span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${badgeTone(account.is_pep_related)}`}>Rel PEP: {account.is_pep_related ? 'Sí' : 'No'}</span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${badgeTone(account.has_us_tax_obligations)}`}>US Tax: {account.has_us_tax_obligations ? 'Sí' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="verificaciones" className="pt-4">
                      <div className="rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
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
                          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-200 flex items-center gap-2">
                            <span className="status-dot status-dot-warn shrink-0" />
                            Riesgo identificado (PEP/Compliance). Revisar manualmente.
                          </div>
                        )}
                        {account.didit_verification_link && (
                          <Button variant="secondary" size="sm" className="mt-4 w-full sm:w-auto" onClick={() => window.open(account.didit_verification_link || '#', '_blank')}>
                            <Link2 size={14} className="mr-2" /> Abrir verificación DIDIT
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="banco" className="pt-3">
                      {(() => {
                        const bankClientId = account.external_customer_id || account.bank_partner_client_id || account.external_account_id || account.id;
                        const phoneForBank = normalized.mainPhone || account.phone_main || undefined;
                        const isSuccessResponse = (resp: unknown) => {
                          const raw = (resp as { status?: unknown })?.status ?? (resp as { statusCode?: unknown })?.statusCode ?? (resp as { code?: unknown })?.code;
                          const numeric = typeof raw === 'string' ? Number(raw) : (raw as number | undefined);
                          if (numeric === 200 || numeric === 201) return true;
                          const text = typeof raw === 'string' ? raw.toLowerCase() : '';
                          return text.includes('200') || text === 'ok' || text === 'created' || text.includes('201') || text === 'completed';
                        };
                        const isErrorPayload = (resp: unknown) => {
                          if (!resp || typeof resp !== 'object') return false;
                          const r = resp as Record<string, unknown>;
                          const status = String(r.status ?? r.statusCode ?? r.code ?? '').toLowerCase();
                          return status === 'error' || status === 'failed' || /^[45]\d{2}$/.test(status) || !!r.error || !!r.error_message;
                        };
                        const hasValidData = (resp: unknown) => {
                          if (!resp || typeof resp !== 'object') return false;
                          return !isErrorPayload(resp) && Object.keys(resp as object).length > 0;
                        };
                        const formatBirthDate = (date?: string | null) => {
                          if (!date) return '';
                          const digits = date.replace(/\D/g, '').slice(0, 8);
                          return digits.length === 8 ? digits : '';
                        };

                        const endpointRows = [
                          { key: 'blacklist', label: 'Blacklist', finishedAt: account.bank_finished_at?.blacklist ?? account.bank_blacklist_finished_at, resp: account.bank_responses?.blacklist ?? account.bank_blacklist_response, action: () => bridgeBlacklist.mutate({ process_id: selectedId, dpi: account.document_number, C75000: account.document_type || '11', C75016: `D${(account.document_number || '').replace(/^D/i, '')}`, C75804: '', C75020: '', C75503: account.document_country || 'GT', C75043: account.document_country || 'GT', C75084: formatBirthDate(account.birth_date) }, { onSuccess: (data) => saveBankStepResult('blacklist', data, false), onError: (e) => saveBankStepResult('blacklist', extractBankStepErrorPayload(e), true) }), pending: bridgeBlacklist.isPending, needsClient: false },
                          { key: 'onboarding', label: 'Onboarding', finishedAt: account.bank_finished_at?.onboarding ?? account.bank_onboarding_finished_at, resp: account.bank_responses?.onboarding ?? account.bank_onboarding_response, action: () => bridgeUpdateOnboarding.mutate({ clientId: bankClientId ?? '', body: { account_opening_id: detailQuery.data?.account_opening_id || selectedId, email: account.email, phone: phoneForBank, full_name: account.full_name } }, { onSuccess: (data) => saveBankStepResult('onboarding', data, false), onError: (e) => saveBankStepResult('onboarding', extractBankStepErrorPayload(e), true) }), pending: bridgeUpdateOnboarding.isPending, needsClient: true },
                          { key: 'account', label: 'Cuenta', finishedAt: account.bank_finished_at?.account ?? account.bank_account_finished_at, resp: account.bank_responses?.account ?? account.bank_account_response, action: () => bridgeCreateAccount.mutate({ clientId: bankClientId ?? '', body: { currency: account.account_currency, product: account.product_type, phone: phoneForBank } }, { onSuccess: (data) => saveBankStepResult('account', data, false), onError: (e) => saveBankStepResult('account', extractBankStepErrorPayload(e), true) }), pending: bridgeCreateAccount.isPending, needsClient: true },
                          { key: 'complementary', label: 'Complementary', finishedAt: account.bank_finished_at?.complementary ?? account.bank_complementary_finished_at, resp: account.bank_responses?.complementary ?? account.bank_complementary_response, action: () => bridgeComplementaryCreate.mutate({ clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, { onSuccess: (data) => saveBankStepResult('complementary', data, false), onError: (e) => saveBankStepResult('complementary', extractBankStepErrorPayload(e), true) }), pending: bridgeComplementaryCreate.isPending, needsClient: true },
                          { key: 'complement_query', label: 'Query', finishedAt: account.bank_finished_at?.complement_query ?? account.bank_complement_query_finished_at, resp: account.bank_responses?.complement_query ?? account.bank_complement_query_response, action: () => bridgeQueryComplement.mutate(bankClientId ?? '', { onSuccess: (data) => saveBankStepResult('complement_query', data, false), onError: (e) => saveBankStepResult('complement_query', extractBankStepErrorPayload(e), true) }), pending: bridgeQueryComplement.isPending, needsClient: true },
                          { key: 'complement_update', label: 'Update', finishedAt: account.bank_finished_at?.complementary_update ?? account.bank_complementary_update_finished_at, resp: account.bank_responses?.complementary_update ?? account.bank_complementary_update_response, action: () => bridgeUpdateComplementary.mutate({ clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, { onSuccess: (data) => saveBankStepResult('complement_update', data, false), onError: (e) => saveBankStepResult('complement_update', extractBankStepErrorPayload(e), true) }), pending: bridgeUpdateComplementary.isPending, needsClient: true },
                          { key: 'cliente', label: 'Consulta', finishedAt: account.bank_finished_at?.client ?? account.bank_client_finished_at, resp: account.bank_responses?.client ?? account.bank_client_response, action: () => bridgeMicoopeClient.mutate(bankClientId ?? '', { onSuccess: (data) => saveBankStepResult('cliente', data, false), onError: (e) => saveBankStepResult('cliente', extractBankStepErrorPayload(e), true) }), pending: bridgeMicoopeClient.isPending, needsClient: true },
                          { key: 'crear_cliente', label: 'Crear', finishedAt: account.bank_finished_at?.client ?? account.bank_client_finished_at, resp: account.bank_responses?.client ?? account.bank_client_response, action: () => bridgeCreateIndividual.mutate({ clientId: bankClientId ?? '', document_number: account.document_number, full_name: account.full_name, phone: phoneForBank } as never, { onSuccess: (data) => saveBankStepResult('crear_cliente', data, false), onError: (e) => saveBankStepResult('crear_cliente', extractBankStepErrorPayload(e), true) }), pending: bridgeCreateIndividual.isPending, needsClient: true },
                        ];

                        return (
                          <div className="space-y-4">
                            {/* Header - Clean */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="space-y-0.5">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Cliente: <span className="font-mono">{valueOrDash(bankClientId)}</span></p>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => detailQuery.refetch()} disabled={detailQuery.isFetching}>
                                <RefreshCw size={12} className={detailQuery.isFetching ? 'animate-spin' : ''} />
                              </Button>
                            </div>

                            {/* Minimal Accordion */}
                            <div className="space-y-px rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
                              {endpointRows.map((ep, idx) => {
                                // Merge local result with server response (local takes priority for just-triggered actions)
                                const localResult = localBankResults[ep.key];
                                const effectiveResp = localResult?.data ?? ep.resp;
                                const isLocalError = localResult?.isError ?? false;

                                // Updated status resolution that accounts for local error results
                                const resolveStatusWithLocal = () => {
                                  if (isLocalError && effectiveResp) return { tone: 'error', label: 'ERROR', done: false };
                                  if (isErrorPayload(effectiveResp)) return { tone: 'error', label: 'ERROR', done: false };
                                  if (ep.finishedAt || isSuccessResponse(effectiveResp) || hasValidData(effectiveResp)) return { tone: 'ok', label: `OK${ep.finishedAt ? ` · ${formatDate(ep.finishedAt)}` : ''}`, done: true };
                                  if (effectiveResp) return { tone: 'error', label: 'Fallo', done: false };
                                  return { tone: 'warn', label: 'Pendiente', done: false };
                                };

                                const st = resolveStatusWithLocal();
                                const isExpanded = activeResponseTab === ep.key;
                                const cooldownKey = `${selectedId}_${ep.key}`;
                                const cooldownRemaining = getCooldownRemaining(cooldownKey);
                                const isOnCooldown = cooldownRemaining > 0;
                                const canTrigger = !st.done && !ep.pending && !isOnCooldown && (!ep.needsClient || bankClientId);

                                return (
                                  <div key={ep.key} className={`transition-all ${idx > 0 ? 'border-t border-slate-100 dark:border-slate-800/40' : ''}`}>
                                    <button
                                      type="button"
                                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                                      onClick={() => setActiveResponseTab(isExpanded ? '' : ep.key)}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        st.done ? 'bg-emerald-500' : st.tone === 'error' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                                      }`} />
                                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 flex-1">{ep.label}</span>
                                      {st.done && <span className="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">{st.label}</span>}
                                      {st.tone === 'error' && !st.done && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 font-medium">ERROR</span>}
                                      {ep.pending && <RefreshCw size={10} className="animate-spin text-slate-400" />}
                                      {isOnCooldown && <span className="text-[9px] font-mono text-amber-500/80">{formatCooldown(cooldownRemaining)}</span>}
                                      {canTrigger && (
                                        <span
                                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-accent hover:text-white transition-colors cursor-pointer"
                                          onClick={(e) => { e.stopPropagation(); triggerCooldown(cooldownKey); ep.action(); }}
                                        >
                                          Disparar
                                        </span>
                                      )}
                                      <svg className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>

                                    {isExpanded && (
                                      <div className={`animate-in fade-in slide-in-from-top-1 duration-150 ${isLocalError ? 'bg-red-50/80 dark:bg-red-950/20' : 'bg-slate-50/80 dark:bg-[#0a0d12]'}`}>
                                        {effectiveResp != null ? (
                                          <div className="relative group">
                                            {isLocalError && (
                                              <div className="px-3 py-2 border-b border-red-200 dark:border-red-900/50 bg-red-100/50 dark:bg-red-900/30">
                                                <span className="text-[10px] font-medium text-red-700 dark:text-red-300">⚠ Error response — el banco rechazó la solicitud</span>
                                              </div>
                                            )}
                                            <button
                                              type="button"
                                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                              onClick={() => { navigator.clipboard.writeText(JSON.stringify(effectiveResp, null, 2)); toast({ title: 'Copiado' }); }}
                                            >
                                              <ClipboardCopy size={10} />
                                            </button>
                                            <pre className="max-h-56 overflow-auto p-3 text-[10px] leading-relaxed font-mono">
                                              <code>
                                                {JSON.stringify(effectiveResp, null, 2).split('\n').map((line, i) => {
                                                  const highlighted = line
                                                    .replace(/^(\s*)("[\w_-]+")(:)/g, '$1<span class="text-fuchsia-600 dark:text-fuchsia-400">$2</span><span class="text-slate-400">$3</span>')
                                                    .replace(/: "(.*?)"/g, ': <span class="text-teal-600 dark:text-teal-400">"$1"</span>')
                                                    .replace(/: (-?\d+\.?\d*)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>')
                                                    .replace(/: (true)/g, ': <span class="text-emerald-500">$1</span>')
                                                    .replace(/: (false)/g, ': <span class="text-rose-500">$1</span>')
                                                    .replace(/: (null)/g, ': <span class="text-slate-400 italic">$1</span>');
                                                  return <div key={i} className="text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />;
                                                })}
                                              </code>
                                            </pre>
                                          </div>
                                        ) : (
                                          <p className="py-4 text-center text-[10px] text-slate-400 italic">Sin datos</p>
                                        )}
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

                    <TabsContent value="raw" className="pt-4">
                      <div className="space-y-3 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                        <details className="group rounded-xl border border-border/50 bg-background/50 overflow-hidden" open>
                          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors flex items-center gap-2">
                            <Database size={14} className="text-accent" />
                            Account
                          </summary>
                          <pre className="max-h-64 overflow-auto px-4 py-3 border-t border-border/30 text-[11px] font-mono bg-muted/30 dark:bg-black/30">
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
                          <details className="group rounded-xl border border-border/50 bg-background/50 overflow-hidden">
                            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors flex items-center gap-2">
                              <FileJson size={14} className="text-accent" />
                              Extra data
                            </summary>
                            <pre className="max-h-64 overflow-auto px-4 py-3 border-t border-border/30 text-[11px] font-mono bg-muted/30 dark:bg-black/30">
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
                </div>
              );
            })()
          ) : (
            <div className="py-6 text-sm text-muted-foreground">Seleccione una tarjeta para ver detalles.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
