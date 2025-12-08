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
import { API_URL } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
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

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const auditReason = '';
  const auditOperator = 'operador.demo@carla';

  const COOLDOWN_KEY = 'carla_banking_cooldowns';
  const COOLDOWN_DURATION = 300;
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

  const onActionError = (message: string, error?: unknown) =>
    toast({ variant: 'destructive', title: message, description: error instanceof Error ? error.message : 'Tente novamente.' });

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
          { label: 'Ativos', value: kpis.active, tone: 'ok' as const },
          { label: 'Erros', value: kpis.errors, tone: kpis.errors ? 'error' as const : 'ok' as const },
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
          <p className="font-semibold text-amber-700 dark:text-amber-200">Configuração de ambiente faltando</p>
          <p className="text-sm text-amber-600 dark:text-amber-300/80 mt-1">
            Defina `VITE_API_URL` e um token API. Sem isso, Procesos não carrega.
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
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground truncate">{shortId(card.rawId)}</p>
                        <h4 className="mt-1 text-base font-semibold text-foreground truncate">{card.title}</h4>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${toneBadge(card.statusDisplay.tone)}`}>
                        {card.statusDisplay.label}
                      </span>
                    </header>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} className="text-accent/70" />
                        <span className="font-mono truncate">{maskPhone(card.phone)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BadgeCheck size={14} className="text-emerald-500/70" />
                        <span className="truncate">{card.verificationDisplay.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Database size={14} className="text-amber-500/70" />
                        <span className="truncate">{card.bankingDisplay.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock4 size={14} />
                        <span className="truncate">{card.updated ? formatRelative(card.updated) : '—'}</span>
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
                Não foi possível carregar processos.
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck size={16} className="text-accent" /> Detalle del proceso
            </SheetTitle>
          </SheetHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-32 w-full" />
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
              const valueOrDash = (v?: string | number | null) => (v === undefined || v === null || v === '' ? 'Sin datos' : v);
              const badgeTone = (v?: boolean) => (v ? 'bg-red-500/15 text-red-700 dark:text-red-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300');
              const renderField = (label: string, value?: string | number | null) => (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="text-sm text-foreground">{valueOrDash(value)}</p>
                </div>
              );

              const statusChips = [
                { label: 'DIDIT', value: account.didit_status },
                { label: 'QIC', value: account.qic_status },
                { label: 'RENAP', value: account.renap_status },
                { label: 'Teléfono', value: account.phone_verification_status },
              ];

              return (
                <div className="space-y-4 py-4 text-sm">
                  <div className="rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-muted-foreground">
                          {detailQuery.data.id}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => detailQuery.data?.id && navigator.clipboard.writeText(detailQuery.data.id)}
                          >
                            <ClipboardCopy size={12} />
                          </Button>
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{fullName}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone size={14} /> {mainPhone}
                          {email !== '—' && <><span className="h-4 w-px bg-border" />{email}</>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusChips.map((chip) => (
                          <Badge key={chip.label} variant="outline" className="text-[11px]">
                            {chip.label}: {valueOrDash(chip.value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="flex w-full flex-wrap gap-2 bg-muted/30 dark:bg-card/50">
                      <TabsTrigger value="resumen" className="flex items-center gap-1"><Info size={14} /> Resumen</TabsTrigger>
                      <TabsTrigger value="verificaciones" className="flex items-center gap-1"><ShieldCheck size={14} /> Verificaciones</TabsTrigger>
                      <TabsTrigger value="banco" className="flex items-center gap-1"><Building2 size={14} /> Banco</TabsTrigger>
                      <TabsTrigger value="raw" className="flex items-center gap-1"><FileJson size={14} /> Debug</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="pt-3">
                      <div className="grid gap-3 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4 md:grid-cols-2">
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
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Flags de riesgo</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={badgeTone(account.is_pep)}>PEP: {account.is_pep ? 'Sí' : 'No'}</Badge>
                            <Badge className={badgeTone(account.is_pep_related)}>Rel PEP: {account.is_pep_related ? 'Sí' : 'No'}</Badge>
                            <Badge className={badgeTone(account.has_us_tax_obligations)}>US Tax: {account.has_us_tax_obligations ? 'Sí' : 'No'}</Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="verificaciones" className="pt-3">
                      <div className="grid gap-3 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4 md:grid-cols-2">
                        {renderField('DIDIT', account.didit_status)}
                        {renderField('Último check DIDIT', formatDate(account.didit_last_check))}
                        {renderField('Decisión DIDIT', account.didit_metadata?.decision?.status)}
                        {renderField('Motivo DIDIT', account.didit_metadata?.decision?.reason)}
                        {renderField('RENAP', account.renap_status)}
                        {renderField('Último check RENAP', formatDate(account.renap_last_check))}
                        {renderField('Teléfono verificación', account.phone_verification_status)}
                        {renderField('OTP verificado', formatDate(account.phone_verification_metadata?.verified_at))}
                        {renderField('Compliance', complianceSource.join(', '))}
                        {risk && (
                          <div className="md:col-span-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-amber-700 dark:text-amber-200">
                            Riesgo identificado (PEP/Compliance). Revisar manualmente.
                          </div>
                        )}
                        {account.didit_verification_link && (
                          <Button variant="secondary" size="sm" className="md:col-span-2" onClick={() => window.open(account.didit_verification_link || '#', '_blank')}>
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
                          return text.includes('200') || text === 'ok' || text === 'created' || text.includes('201');
                        };
                        const resolveStatus = (finishedAt?: string | null, resp?: unknown) => {
                          if (isSuccessResponse(resp) || finishedAt) return { tone: 'ok', label: `OK${finishedAt ? ` · ${formatDate(finishedAt)}` : ''}`, done: true };
                          if (resp) return { tone: 'error', label: 'Falha', done: false };
                          return { tone: 'warn', label: 'Pendente', done: false };
                        };
                        const formatBirthDate = (date?: string | null) => {
                          if (!date) return '';
                          const digits = date.replace(/\D/g, '').slice(0, 8);
                          return digits.length === 8 ? digits : '';
                        };
                        const endpointRows = [
                          { key: 'blacklist', label: 'Blacklist', finishedAt: account.bank_blacklist_finished_at, resp: account.bank_blacklist_response, action: () => bridgeBlacklist.mutate({ C75000: account.document_type || '11', C75016: `D${(account.document_number || '').replace(/^D/i, '')}`, C75804: '', C75020: '', C75503: account.document_country || 'GT', C75043: account.document_country || 'GT', C75084: formatBirthDate(account.birth_date) }), pending: bridgeBlacklist.isPending, needsClient: false },
                          { key: 'onboarding', label: 'Onboarding', finishedAt: account.bank_onboarding_finished_at, resp: account.bank_onboarding_response, action: () => bridgeUpdateOnboarding.mutate({ clientId: bankClientId ?? '', body: { email: account.email, phone: phoneForBank, full_name: account.full_name } }), pending: bridgeUpdateOnboarding.isPending, needsClient: true },
                          { key: 'account', label: 'Cuenta', finishedAt: account.bank_account_finished_at, resp: account.bank_account_response, action: () => bridgeCreateAccount.mutate({ clientId: bankClientId ?? '', body: { currency: account.account_currency, product: account.product_type, phone: phoneForBank } }), pending: bridgeCreateAccount.isPending, needsClient: true },
                          { key: 'complementary', label: 'Complementary', finishedAt: account.bank_complementary_finished_at, resp: account.bank_complementary_response, action: () => bridgeComplementaryCreate.mutate({ clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }), pending: bridgeComplementaryCreate.isPending, needsClient: true },
                          { key: 'complement_query', label: 'Complement Query', finishedAt: account.bank_complement_query_finished_at, resp: account.bank_complement_query_response, action: () => bridgeQueryComplement.mutate(bankClientId ?? ''), pending: bridgeQueryComplement.isPending, needsClient: true },
                          { key: 'complement_update', label: 'Complement Update', finishedAt: account.bank_complementary_update_finished_at, resp: account.bank_complementary_update_response, action: () => bridgeUpdateComplementary.mutate({ clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }), pending: bridgeUpdateComplementary.isPending, needsClient: true },
                          { key: 'cliente', label: 'Consulta Micoope', finishedAt: account.bank_client_finished_at, resp: account.bank_client_response, action: () => bridgeMicoopeClient.mutate(bankClientId ?? ''), pending: bridgeMicoopeClient.isPending, needsClient: true },
                          { key: 'crear_cliente', label: 'Crear Individual', finishedAt: account.bank_client_finished_at, resp: account.bank_client_response, action: () => bridgeCreateIndividual.mutate({ clientId: bankClientId ?? '', document_number: account.document_number, full_name: account.full_name, phone: phoneForBank } as never), pending: bridgeCreateIndividual.isPending, needsClient: true },
                        ];
                        return (
                          <div className="space-y-3 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border/30">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">{`Institución: ${valueOrDash(account.institution_name)}`}</p>
                                <p className="font-mono text-xs text-muted-foreground">{valueOrDash(bankClientId)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-2 py-1 text-[10px] text-accent">
                                  <span className="status-dot status-dot-ok" /> Auto 60s
                                </span>
                                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => detailQuery.refetch()} disabled={detailQuery.isFetching}>
                                  <RefreshCw size={12} className={detailQuery.isFetching ? 'animate-spin' : ''} />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Espere 5min entre disparos del mismo servicio.</p>
                            <div className="grid gap-2 md:grid-cols-2">
                              {endpointRows.map((ep) => {
                                const st = resolveStatus(ep.finishedAt, ep.resp);
                                const cooldownKey = `${selectedId}_${ep.key}`;
                                const cooldownRemaining = getCooldownRemaining(cooldownKey);
                                const isOnCooldown = cooldownRemaining > 0;
                                const disabled = st.done || ep.pending || isOnCooldown || (ep.needsClient && !bankClientId);
                                return (
                                  <div key={ep.key} className={`flex items-center justify-between gap-3 rounded-xl bg-background/50 border px-3 py-3 ${isOnCooldown ? 'border-amber-500/40' : st.done ? 'border-emerald-500/30' : 'border-border/50'}`}>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                                        <span className={`status-dot ${st.done ? 'status-dot-ok' : isOnCooldown ? 'status-dot-warn' : ep.pending ? 'status-dot-warn' : ''}`} />
                                        {ep.label}
                                      </div>
                                      <span className={`inline-flex text-[11px] ${st.tone === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : st.tone === 'error' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {st.label}
                                      </span>
                                    </div>
                                    <Button size="sm" variant={isOnCooldown ? 'secondary' : 'outline'} disabled={disabled} className="min-w-[80px]" onClick={() => { triggerCooldown(cooldownKey); ep.action(); }}>
                                      {st.done ? 'OK' : ep.pending ? <RefreshCw size={12} className="animate-spin" /> : isOnCooldown ? <span className="font-mono">{formatCooldown(cooldownRemaining)}</span> : 'Disparar'}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="raw" className="pt-3">
                      <div className="space-y-3 rounded-2xl bg-muted/30 dark:bg-card/50 border border-border/50 p-4">
                        <details className="rounded-xl border border-border/50 bg-background/50 p-3">
                          <summary className="cursor-pointer text-sm font-medium text-foreground">Account</summary>
                          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/50 dark:bg-black/30 p-3 text-[11px] font-mono text-foreground/80">
                            {JSON.stringify(account, null, 2)}
                          </pre>
                        </details>
                        {account.extra_data && (
                          <details className="rounded-xl border border-border/50 bg-background/50 p-3">
                            <summary className="cursor-pointer text-sm font-medium text-foreground">Extra data</summary>
                            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/50 dark:bg-black/30 p-3 text-[11px] font-mono text-foreground/80">
                              {JSON.stringify(account.extra_data, null, 2)}
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
