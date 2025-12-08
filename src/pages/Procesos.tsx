import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardCopy,
  Clock4,
  Database,
  FileJson,
  Home,
  Info,
  Link2,
  Phone,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProcessDetail, useProcessRetry, useProcessRerun, useProcessStatus, useProcessesAdmin } from '@/hooks/use-carla-data';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, mapStatusDisplay, maskPhone, normalizeAccountForUi, shortId, toneBadge } from '@/lib/utils';
import type { Account, RenapCitizenEntry } from '@/types/account';

const confirmDanger = (message: string) => window.confirm(message || '¿Continuar?');

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const auditReason = '';
  const auditOperator = 'operador.demo@carla';

  const filters = useMemo(() => ({ q: search, status, phone, limit: 30 }), [phone, search, status]);
  const listQuery = useProcessesAdmin(filters);
  const detailQuery = useProcessDetail(selectedId);

  const statusMutation = useProcessStatus(selectedId);
  const retryMutation = useProcessRetry(selectedId);
  const rerunMutation = useProcessRerun(selectedId);

  const processes = listQuery.data || [];
  const resolvedBaseUrl = API_URL;
  const resolvedToken = (
    import.meta.env.VITE_API_TOKEN ||
    import.meta.env.VITE_CARLA_SERVICIOS_API_KEY ||
    import.meta.env.VITE_CHANNELS_API_KEY ||
    ''
  ).trim();

  const kpis = useMemo(() => {
    const total = processes.length;
    const active = processes.filter((p) => (p.status || '').toLowerCase().includes('ready') || (p.banking_status || '').includes('processing') || (p.status || '').includes('created')).length;
    const errors = processes.filter((p) => /error|reject|fail/.test((p.status || p.banking_status || p.last_error || '').toLowerCase())).length;
    const retry = processes.filter((p) => /retry/.test((p.status || p.banking_status || '').toLowerCase())).length;
    return { total, active, errors, retry };
  }, [processes]);

  const onActionError = (message: string, error?: unknown) =>
    toast({
      variant: 'destructive',
      title: message,
      description: error instanceof Error ? error.message : 'Tente novamente em instantes.',
    });

  const cards = processes.map((p) => {
    const account = (p as { account?: Account })?.account;
    const normalized = normalizeAccountForUi(account, { id: p.id, phone: p.phone, name: p.name });
    const displayName = normalized.displayName || maskPhone(p.phone) || shortId(p.id);
    const statusDisplay = mapStatusDisplay(p.status || p.banking_status);
    const verificationDisplay = mapStatusDisplay(p.verification_status);
    const bankingDisplay = mapStatusDisplay(p.banking_status);
    return {
      id: p.id,
      title: displayName,
      rawId: p.id,
      statusDisplay,
      phone: normalized.mainPhone || p.phone,
      attempts: p.attempts,
      events: p.events_count,
      lastError: p.last_error,
      updated: p.updated_at || p.last_error_at || p.created_at,
      verificationDisplay,
      bankingDisplay,
    };
  });

  const auditFields = useMemo(() => ({ operator: auditOperator || undefined, reason: auditReason || undefined }), [auditOperator, auditReason]);

  const renderHeaderKpi = (label: string, value: number | string, tone: 'ok' | 'warn' | 'error' = 'ok', helper?: string) => {
    const style =
      tone === 'error'
        ? 'border-destructive/30 text-destructive'
        : tone === 'warn'
          ? 'border-amber-400/40 text-amber-200'
          : 'border-emerald-400/40 text-emerald-300';
    return (
      <div className="rounded-xl border bg-background/60 px-3 py-2 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/60">{label}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-lg font-semibold ${style}`}>{value}</span>
          {helper ? <span className="text-[11px] text-foreground/50">{helper}</span> : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/50 bg-surface/80 px-4 py-3 shadow-[0_10px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">Mission Control · Procesos</p>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Procesos de WhatsApp · 360 Backoffice</h3>
            <Badge variant="outline" className="flex items-center gap-1 text-[11px] border-accent/40 text-accent">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Live · 30s
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-[11px]">
              <Link2 size={12} /> Banking API map
            </Badge>
          </div>
          <p className="text-xs text-foreground/60">Flujos de apertura/crédito con estado, intentos y timeline bancario/verificación.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {renderHeaderKpi('Ativos', kpis.active, 'ok')}
          {renderHeaderKpi('Erros', kpis.errors, kpis.errors ? 'error' : 'ok')}
          {renderHeaderKpi('Retry', kpis.retry, kpis.retry ? 'warn' : 'ok')}
          {renderHeaderKpi('Total', kpis.total, 'ok')}
          <Button variant="ghost" size="icon" onClick={() => listQuery.refetch()}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </header>

      {(!resolvedBaseUrl || !resolvedToken) && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-semibold">Configuração de ambiente faltando</p>
          <p className="text-amber-50/80">
            Defina `VITE_API_URL` ou `VITE_CARLA_SERVICIOS_API_URL` e um token (`VITE_API_TOKEN` ou `VITE_CARLA_SERVICIOS_API_KEY`). Sem isso, Procesos não carrega os dados.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por teléfono, id, estado"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm"
          id="process-search"
          name="process-search"
        />
        <Input
          placeholder="Filtro por phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full max-w-xs text-sm"
          id="process-phone"
          name="process-phone"
        />
        <div className="flex items-center gap-2">
          {['', 'ready_for_bank', 'bank_processing', 'bank_retry', 'bank_rejected'].map((s) => (
            <Button key={s || 'all'} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s)} className="text-xs">
              {s === '' ? 'Todos' : s.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="glass border-border/60 bg-surface/90 text-foreground">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <CardTitle className="text-sm font-semibold">Procesos en tiempo real</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1 text-[11px] border-border/60 text-foreground/70">
              <Activity size={14} /> Auto-refresh 30s
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {listQuery.isLoading
              ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-40 w-full bg-foreground/10" />)
              : cards.map((card) => (
                  <article
                    key={card.id}
                    className="group relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-border/50 bg-background/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_16px_40px_rgba(93,163,255,0.25)]"
                    onClick={() => setSelectedId(card.id)}
                  >
                    <header className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60" title={card.rawId}>
                          {shortId(card.rawId)}
                        </p>
                        <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] ${toneBadge(card.statusDisplay.tone)}`}>{card.statusDisplay.label}</span>
                    </header>
                    <section className="grid grid-cols-2 gap-2 text-xs text-foreground/70">
                      <span className="flex items-center gap-2">
                        <Phone size={12} /> {maskPhone(card.phone)}
                      </span>
                      <span className="flex items-center gap-2">
                        <BadgeCheck size={12} /> Verif: {card.verificationDisplay.label}
                      </span>
                      <span className="flex items-center gap-2">
                        <Database size={12} /> Banco: {card.bankingDisplay.label}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock4 size={12} /> {card.updated || '—'}
                      </span>
                    </section>
                    <section className="flex items-center gap-3 text-[11px] text-foreground/60">
                      <span className="flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-1">
                        <ShieldCheck size={12} /> Intentos: {card.attempts ?? '—'}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-1">
                        <Activity size={12} /> Eventos: {card.events ?? '—'}
                      </span>
                    </section>
                    {card.lastError ? (
                      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
                        {card.lastError.slice(0, 140)}
                      </p>
                    ) : (
                      <p className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-[11px] text-foreground/70">Flujo operacional OK.</p>
                    )}
                    <footer className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          disabled={retryMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!confirmDanger('Recolocar en retry?')) return;
                            retryMutation.mutate(
                              { ...auditFields },
                              { onError: (er) => onActionError('Fallo al retry', er), onSuccess: () => toast({ title: 'Retry enviado', description: 'Worker actualizado.' }) },
                            );
                          }}
                        >
                          <Repeat2 size={14} className="mr-1" /> Retry
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        disabled={rerunMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!confirmDanger('Rerun incluye eventos. ¿Continuar?')) return;
                          rerunMutation.mutate(
                            { include_events: true, ...auditFields },
                            { onError: (er) => onActionError('Fallo al rerun', er), onSuccess: () => toast({ title: 'Rerun disparado', description: 'Worker en ejecución.' }) },
                          );
                        }}
                      >
                        <Sparkles size={14} className="mr-1" /> Rerun
                      </Button>
                    </footer>
                  </article>
                ))}
            {listQuery.isError ? (
              <div className="col-span-full rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">Não foi possível carregar processos.</div>
            ) : null}
            {!listQuery.isLoading && !processes.length ? (
              <div className="col-span-full rounded-lg border border-border/50 bg-background/70 px-3 py-3 text-sm text-foreground/70">Sem processos para esse filtro.</div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass border-border/60 bg-surface/90 text-foreground">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ArrowRight size={14} /> Acciones rápidas
            </CardTitle>
            <Badge variant="outline" className="text-[11px] border-border/60 text-foreground/70">
              Auditoría + Dry run seguro
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            <section className="rounded-lg border border-border/50 bg-background/70 p-3">
              <p className="font-medium text-foreground">Forzar estado</p>
              <p className="text-xs text-foreground/60">Usar tras corregir manualmente; pide motivo y operador.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['ready_for_bank', 'bank_processing', 'bank_retry', 'bank_rejected', 'account_created'].map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="text-[11px]"
                    disabled={!selectedId || statusMutation.isPending}
                    onClick={() => {
                      if (!confirmDanger(`Forzar estado "${s}"?`)) return;
                      statusMutation.mutate(
                        { status: s, ...auditFields },
                        { onError: (e) => onActionError('Fallo al forzar estado', e), onSuccess: () => toast({ title: 'Estado ajustado', description: s }) },
                      );
                    }}
                  >
                    {s.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-border/50 bg-background/70 p-3">
              <p className="font-medium text-foreground">Tips de uso</p>
              <ul className="mt-1 space-y-1 text-xs text-foreground/65">
                <li className="flex items-center gap-2">
                  <BadgeCheck size={12} className="text-emerald-300" /> Usa retry después de corregir payload.
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle size={12} className="text-amber-300" /> Rerun es más pesado: incluye eventos y worker completo.
                </li>
                <li className="flex items-center gap-2">
                  <Activity size={12} className="text-accent" /> Timeline muestra correlation_id y pasos bancarios.
                </li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => setSelectedId(open ? selectedId : undefined)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck size={16} className="text-accent" /> Detalle del proceso
            </SheetTitle>
          </SheetHeader>
          {detailQuery.isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-4 w-2/3 bg-foreground/10" />
              <Skeleton className="h-4 w-full bg-foreground/10" />
              <Skeleton className="h-32 w-full bg-foreground/10" />
            </div>
          ) : detailQuery.data ? (
            (() => {
              const account = (detailQuery.data?.account || {}) as Account;
              const normalized = normalizeAccountForUi(account, { id: detailQuery.data.id, phone: detailQuery.data.phone, name: detailQuery.data.name });
              const renapEntry = normalized.renapEntry as RenapCitizenEntry | undefined;
              const fullName = normalized.fullName || normalized.displayName || '—';
              const mainPhone = normalized.mainPhone || '—';
              const email = normalized.email || '—';
              const complianceSource = normalized.complianceSource;
              const risk = normalized.riskFlags.risk;
              const valueOrDash = (v?: string | number | null) => (v === undefined || v === null || v === '' ? '—' : v);
              const badgeTone = (v?: boolean) => (v ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/10 text-emerald-200');
              const renderField = (label: string, value?: string | number | null) => (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">{label}</p>
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
                  <div className="rounded-2xl border border-border/50 bg-background/80 p-4 shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-foreground/60">
                          {detailQuery.data.id}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-foreground/70"
                            onClick={() => detailQuery.data?.id && navigator.clipboard.writeText(detailQuery.data.id)}
                            title="Copiar ID"
                          >
                            <ClipboardCopy size={14} />
                          </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{fullName}</h3>
                          {account.is_demo ? <Badge variant="outline">DEMO</Badge> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-foreground/70">
                          <Phone size={14} /> {mainPhone}
                          {email && email !== '—' ? (
                            <>
                              <span className="h-4 w-px bg-border/60" />
                              {email}
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <Badge className="rounded-full px-3 py-1 text-[11px]">{account.status || detailQuery.data.statusDisplay?.label || '—'}</Badge>
                        <div className="flex flex-wrap justify-end gap-2">
                          {statusChips.map((chip) => (
                            <Badge key={chip.label} variant="outline" className="text-[11px]">
                              {chip.label}: {valueOrDash(chip.value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="resumen" className="w-full">
                    <TabsList className="flex w-full flex-wrap gap-2 bg-background/70">
                      <TabsTrigger value="resumen" className="flex items-center gap-1">
                        <Info size={14} /> Resumen
                      </TabsTrigger>
                      <TabsTrigger value="personales" className="flex items-center gap-1">
                        <User size={14} /> Datos personales
                      </TabsTrigger>
                      <TabsTrigger value="contacto" className="flex items-center gap-1">
                        <Home size={14} /> Contacto & Dirección
                      </TabsTrigger>
                      <TabsTrigger value="ingresos" className="flex items-center gap-1">
                        <Wallet size={14} /> Trabajo & ingresos
                      </TabsTrigger>
                      <TabsTrigger value="verificaciones" className="flex items-center gap-1">
                        <ShieldCheck size={14} /> Verificaciones
                      </TabsTrigger>
                      <TabsTrigger value="banco" className="flex items-center gap-1">
                        <Building2 size={14} /> Banco / Integraciones
                      </TabsTrigger>
                      <TabsTrigger value="raw" className="flex items-center gap-1">
                        <FileJson size={14} /> Raw / Debug
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumen" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('Canal', account.channel)}
                        {renderField('Producto', account.product_type)}
                        {renderField('Moneda', account.account_currency)}
                        {renderField('Institución', `${valueOrDash(account.institution_name)} (${valueOrDash(account.institution_code)})`)}
                        {renderField('Creado', formatDate(account.created_at))}
                        {renderField('Verificación iniciada', formatDate(account.verification_started_at))}
                        {renderField('Verificación completada', formatDate(account.verification_completed_at))}
                        {renderField('Estado', account.status)}
                      </div>
                    </TabsContent>

                    <TabsContent value="personales" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('Nombre completo', fullName)}
                        {renderField('CUI (RENAP)', renapEntry?.cui)}
                        {renderField('Documento', normalized.documentLabel)}
                        {renderField('Fecha de nacimiento', formatDate(renapEntry?.fecha_nacimiento || account.birth_date))}
                        {renderField('Nacionalidad', normalized.nationality)}
                        {renderField('Estado civil', normalized.maritalStatus)}
                        <div className="space-y-1 md:col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Flags de riesgo</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={badgeTone(account.is_pep)}>PEP: {account.is_pep ? 'Sí' : 'No'}</Badge>
                            <Badge className={badgeTone(account.is_pep_related)}>Relacionado PEP: {account.is_pep_related ? 'Sí' : 'No'}</Badge>
                            <Badge className={badgeTone(account.has_us_tax_obligations)}>Obligación fiscal US: {account.has_us_tax_obligations ? 'Sí' : 'No'}</Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contacto" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('Email', email)}
                        {renderField('Teléfono principal', mainPhone)}
                        {renderField('Teléfono secundario', account.phone_secondary)}
                        {renderField('WhatsApp', account.whatsapp_phone_e164)}
                        {renderField('Dirección', normalized.address)}
                        {renderField('Ciudad', account.address_city)}
                        {renderField('Estado/Depto', account.address_state)}
                        {renderField('País', account.address_country)}
                        {renderField('Tipo vivienda', normalized.housingType)}
                      </div>
                    </TabsContent>

                    <TabsContent value="ingresos" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('Situación laboral', normalized.employmentStatus)}
                        {renderField('Empresa', normalized.employer)}
                        {renderField('Ingresos mensuales', formatCurrency(normalized.monthlyIncome ?? undefined, account.account_currency))}
                        {renderField('Egresos mensuales', formatCurrency(normalized.monthlyExpenses ?? undefined, account.account_currency))}
                        {renderField('Otras fuentes', normalized.otherIncomeSources)}
                      </div>
                    </TabsContent>

                    <TabsContent value="verificaciones" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('DIDIT', account.didit_status)}
                        {renderField('Último check DIDIT', formatDate(account.didit_last_check))}
                        {renderField('Decisión DIDIT', account.didit_metadata?.decision?.status)}
                        {renderField('Motivo DIDIT', account.didit_metadata?.decision?.reason)}
                        {renderField('RENAP', account.renap_status)}
                        {renderField('Último check RENAP', formatDate(account.renap_last_check))}
                        {renderField('Vecindad (RENAP)', renapEntry?.vecindad)}
                        {renderField('Ocupación (RENAP)', renapEntry?.ocupacion)}
                        {renderField('Vencimiento DPI', formatDate(renapEntry?.fecha_vencimiento))}
                        {renderField('Teléfono verificación', account.phone_verification_status)}
                        {renderField('OTP verificado', formatDate(account.phone_verification_metadata?.verified_at))}
                        {renderField('Compliance', complianceSource.join(', '))}
                        {risk ? (
                          <div className="md:col-span-2 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-amber-200">
                            Riesgo identificado (PEP/Compliance). Revisar manualmente.
                          </div>
                        ) : null}
                        {account.didit_verification_link ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="md:col-span-2"
                            onClick={() => window.open(account.didit_verification_link || '#', '_blank')}
                          >
                            <Link2 size={14} className="mr-2" /> Abrir verificación DIDIT
                          </Button>
                        ) : null}
                      </div>
                    </TabsContent>

                    <TabsContent value="banco" className="pt-3">
                      <div className="grid gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 md:grid-cols-2">
                        {renderField('External account id', account.external_account_id)}
                        {renderField('External customer id', account.external_customer_id)}
                        {renderField('Última integración', formatDate(account.last_integration_at))}
                        {renderField('Blacklist terminado', formatDate(account.bank_blacklist_finished_at))}
                        {renderField('Onboarding terminado', formatDate(account.bank_onboarding_finished_at))}
                        {renderField('Cuenta terminada', formatDate(account.bank_account_finished_at))}
                        {renderField('Complementario terminado', formatDate(account.bank_complementary_finished_at))}
                        {renderField('Complement query', formatDate(account.bank_complement_query_finished_at))}
                        {renderField('Complement update', formatDate(account.bank_complementary_update_finished_at))}
                      </div>
                    </TabsContent>

                    <TabsContent value="raw" className="pt-3">
                      <div className="space-y-3 rounded-2xl border border-border/50 bg-background/70 p-4 text-[12px]">
                        <details className="rounded border border-border/60 bg-background/80 p-3" open={false}>
                          <summary className="cursor-pointer text-foreground">Account</summary>
                          <pre className="mt-2 max-h-64 overflow-auto rounded bg-foreground/5 p-2 text-[11px] leading-relaxed text-foreground/80">
                            {JSON.stringify(account, null, 2)}
                          </pre>
                        </details>
                        {account.renap_citizen_data ? (
                          <details className="rounded border border-border/60 bg-background/80 p-3" open={false}>
                            <summary className="cursor-pointer text-foreground">RENAP</summary>
                            <pre className="mt-2 max-h-64 overflow-auto rounded bg-foreground/5 p-2 text-[11px] leading-relaxed text-foreground/80">
                              {JSON.stringify(account.renap_citizen_data, null, 2)}
                            </pre>
                          </details>
                        ) : null}
                        {account.extra_data ? (
                          <details className="rounded border border-border/60 bg-background/80 p-3" open={false}>
                            <summary className="cursor-pointer text-foreground">Extra data</summary>
                            <pre className="mt-2 max-h-64 overflow-auto rounded bg-foreground/5 p-2 text-[11px] leading-relaxed text-foreground/80">
                              {JSON.stringify(account.extra_data, null, 2)}
                            </pre>
                          </details>
                        ) : null}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              );
            })()
          ) : (
            <div className="py-6 text-sm text-foreground/60">Seleccione una tarjeta para ver detalles.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
