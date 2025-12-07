import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, BadgeCheck, Check, Clock4, Database, FileInput, Link2, Phone, RefreshCw, Repeat2, Send, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  useBankingRetry,
  useBankingStatus,
  useDiditOverride,
  useDiditRegenerate,
  useOtpMarkVerified,
  useOtpResend,
  usePhoneCampaignTrigger,
  useProcessDetail,
  useProcessEvents,
  useProcessRetry,
  useProcessRerun,
  useProcessStatus,
  useProcessesAdmin,
  useVerificationApproveManual,
  useVerificationRejectManual,
} from '@/hooks/use-carla-data';
import { useToast } from '@/hooks/use-toast';
import { mapStatusDisplay, maskPhone, shortId, toneBadge, toneDot } from '@/lib/utils';

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [auditReason, setAuditReason] = useState('');
  const [auditOperator, setAuditOperator] = useState('');
  const [diditStatus, setDiditStatus] = useState<'approved' | 'rejected' | 'pending' | 'error'>('approved');
  const [diditNote, setDiditNote] = useState('');

  const filters = useMemo(() => ({ q: search, status, phone, limit: 30 }), [phone, search, status]);
  const listQuery = useProcessesAdmin(filters);
  const detailQuery = useProcessDetail(selectedId);
  const eventsQuery = useProcessEvents(selectedId);

  const statusMutation = useProcessStatus(selectedId);
  const retryMutation = useProcessRetry(selectedId);
  const rerunMutation = useProcessRerun(selectedId);
  const processId = detailQuery.data?.id || selectedId;
  const verificationId = detailQuery.data?.account_opening_id || processId;
  const phoneForActions = detailQuery.data?.phone;

  const approveVerification = useVerificationApproveManual(verificationId, processId);
  const rejectVerification = useVerificationRejectManual(verificationId, processId);
  const otpResend = useOtpResend(processId);
  const otpMarkVerified = useOtpMarkVerified(processId);
  const diditRegenerate = useDiditRegenerate(verificationId, processId);
  const diditOverride = useDiditOverride(verificationId, processId);
  const phoneCampaign = usePhoneCampaignTrigger(processId);
  const bankingStatus = useBankingStatus(processId, processId);
  const bankingRetry = useBankingRetry(processId, processId);

  const processes = listQuery.data || [];

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

  const confirmDanger = (label: string) => window.confirm(label);
  const ensureTarget = (id?: string, message?: string) => {
    if (!id) {
      onActionError(message || 'Selecione um processo');
      return false;
    }
    return true;
  };

  const cards = processes.map((p) => {
    const displayName =
      (p as { account?: { name?: string } })?.account?.name ||
      (p as { beneficiaries?: Array<{ name?: string }> })?.beneficiaries?.[0]?.name ||
      p.name ||
      maskPhone(p.phone) ||
      shortId(p.id);
    const statusDisplay = mapStatusDisplay(p.status || p.banking_status);
    const verificationDisplay = mapStatusDisplay(p.verification_status);
    const bankingDisplay = mapStatusDisplay(p.banking_status);
    return {
      id: p.id,
      title: displayName,
      rawId: p.id,
      statusDisplay,
      phone: p.phone,
      attempts: p.attempts,
      events: p.events_count,
      lastError: p.last_error,
      updated: p.updated_at || p.last_error_at || p.created_at,
      verificationDisplay,
      bankingDisplay,
    };
  });

  const eventList = eventsQuery.data || detailQuery.data?.events || [];
  const timeline = detailQuery.data?.timeline || detailQuery.data?.banking_events || [];
  const auditFields = useMemo(() => ({ operator: auditOperator || undefined, reason: auditReason || undefined }), [auditOperator, auditReason]);
  const actionToast = (title: string, description: string) => toast({ title, description });

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

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por teléfono, id, estado"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm"
        />
        <Input placeholder="Filtro por phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full max-w-xs text-sm" />
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
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
            <div className="space-y-4 py-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-foreground/60">{detailQuery.data.id}</p>
                  <p className="text-base font-semibold text-foreground">
                    {detailQuery.data.displayName || detailQuery.data.name || detailQuery.data.phone || 'Proceso'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${toneBadge(detailQuery.data.statusDisplay?.tone || 'info')}`}>
                    {detailQuery.data.statusDisplay?.label || '—'}
                  </span>
                  {detailQuery.data.correlation_id ? (
                    <span className="rounded bg-foreground/10 px-2 py-1 text-[11px] text-foreground/70">corr: {detailQuery.data.correlation_id}</span>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px] text-foreground/70">
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Teléfono</p>
                  <p>{detailQuery.data.phoneMasked || detailQuery.data.phone || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Intentos</p>
                  <p>{detailQuery.data.attempts ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Banco</p>
                  <p>{detailQuery.data.bankingDisplay?.label || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Verificación</p>
                  <p>{detailQuery.data.verificationDisplay?.label || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Eventos</p>
                  <p>{detailQuery.data.events_count ?? eventList.length ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/70 p-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Atualizado</p>
                  <p>{detailQuery.data.timestampFmt || '—'}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-background/70 p-3 text-[12px] text-foreground/80">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/60">
                  <Database size={12} /> Dados do processo
                </div>
                <div className="mt-2 grid gap-2">
                  <p>ID abertura: {detailQuery.data.account_opening_id || '—'}</p>
                  <p>Produto: {detailQuery.data.product_type || '—'} · Moeda: {detailQuery.data.account_currency || '—'}</p>
                  {detailQuery.data.last_error ? (
                    <span className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-destructive">{detailQuery.data.last_error}</span>
                  ) : null}
                  {detailQuery.data.meta ? (
                    <pre className="rounded bg-foreground/5 p-2 text-[11px] leading-relaxed text-foreground/70">
                      {JSON.stringify(detailQuery.data.meta, null, 2)}
                    </pre>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/50 bg-background/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Controles do cliente</p>
                  <Badge variant="outline" className="text-[11px]">Audit + Dry run seguro</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Operador" value={auditOperator} onChange={(e) => setAuditOperator(e.target.value)} className="h-8 text-xs" />
                  <Input placeholder="Motivo / reason" value={auditReason} onChange={(e) => setAuditReason(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="text-xs"
                    disabled={!verificationId || approveVerification.isPending}
                    onClick={() => {
                      if (!ensureTarget(verificationId, 'Precisa do account_opening_id')) return;
                      approveVerification.mutate(
                        auditFields,
                        { onError: (e) => onActionError('Aprovar manual', e), onSuccess: () => actionToast('Aprovado', 'QIC marcado aprovado') },
                      );
                    }}
                  >
                    <Check size={14} className="mr-1" /> Aprovar manual
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={!verificationId || rejectVerification.isPending}
                    onClick={() => {
                      if (!ensureTarget(verificationId, 'Precisa do account_opening_id')) return;
                      rejectVerification.mutate(
                        auditFields,
                        { onError: (e) => onActionError('Rejeitar manual', e), onSuccess: () => actionToast('Rejeitado', 'QIC marcado rejeitado') },
                      );
                    }}
                  >
                    <X size={14} className="mr-1" /> Rejeitar manual
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    disabled={!phoneForActions || otpResend.isPending}
                    onClick={() => {
                      if (!phoneForActions) return onActionError('Telefone não encontrado');
                      otpResend.mutate(
                        { ...auditFields, phone: phoneForActions, account_opening_id: verificationId },
                        { onError: (e) => onActionError('Reenviar OTP', e), onSuccess: () => actionToast('OTP reenviado', phoneForActions) },
                      );
                    }}
                  >
                    <Send size={14} className="mr-1" /> Reenviar OTP
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={!phoneForActions || otpMarkVerified.isPending}
                    onClick={() => {
                      if (!phoneForActions) return onActionError('Telefone não encontrado');
                      otpMarkVerified.mutate(
                        { ...auditFields, phone: phoneForActions, account_opening_id: verificationId },
                        { onError: (e) => onActionError('Marcar verificado', e), onSuccess: () => actionToast('OTP marcado verificado', phoneForActions) },
                      );
                    }}
                  >
                    <ShieldCheck size={14} className="mr-1" /> OTP verificado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={!verificationId || diditRegenerate.isPending}
                    onClick={() => {
                      if (!ensureTarget(verificationId, 'Precisa do verification id')) return;
                      diditRegenerate.mutate(
                        auditFields,
                        { onError: (e) => onActionError('Regenerar DIDIT', e), onSuccess: () => actionToast('DIDIT regenerado', 'Novo link enviado') },
                      );
                    }}
                  >
                    <RefreshCw size={14} className="mr-1" /> Regenerar DIDIT
                  </Button>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 w-full rounded-md border border-border/60 bg-background/60 px-2 text-xs"
                      value={diditStatus}
                      onChange={(e) => setDiditStatus(e.target.value as typeof diditStatus)}
                    >
                      {['approved', 'rejected', 'pending', 'error'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Input placeholder="Nota DIDIT" value={diditNote} onChange={(e) => setDiditNote(e.target.value)} className="h-8 text-xs" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      disabled={!verificationId || diditOverride.isPending}
                      onClick={() => {
                        if (!ensureTarget(verificationId, 'Precisa do verification id')) return;
                        diditOverride.mutate(
                          { ...auditFields, status: diditStatus, note: diditNote || undefined },
                          { onError: (e) => onActionError('Override DIDIT', e), onSuccess: () => actionToast('DIDIT override', diditStatus) },
                        );
                      }}
                    >
                      <FileInput size={14} className="mr-1" /> Override DIDIT
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={!phoneForActions || phoneCampaign.isPending}
                    onClick={() => {
                      if (!phoneForActions) return onActionError('Telefone não encontrado');
                      phoneCampaign.mutate(
                        { ...auditFields, batch_size: 1, phone: phoneForActions },
                        { onError: (e) => onActionError('Campanha OTP', e), onSuccess: () => actionToast('Campanha disparada', phoneForActions) },
                      );
                    }}
                  >
                    <Zap size={14} className="mr-1" /> Campanha OTP
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    disabled={!processId || bankingRetry.isPending}
                    onClick={() => {
                      if (!ensureTarget(processId, 'Selecione um processo')) return;
                      bankingRetry.mutate(
                        auditFields,
                        { onError: (e) => onActionError('Retry bancário', e), onSuccess: () => actionToast('Retry bancário', 'bank_retry enviado') },
                      );
                    }}
                  >
                    <Repeat2 size={14} className="mr-1" /> Bank retry
                  </Button>
                  <div className="flex items-center gap-2">
                    {['ready_for_bank', 'bank_processing', 'bank_retry', 'bank_rejected', 'account_created'].map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="ghost"
                        className="text-[11px]"
                        disabled={!processId || bankingStatus.isPending}
                        onClick={() => {
                          if (!ensureTarget(processId, 'Selecione um processo')) return;
                          bankingStatus.mutate(
                            { ...auditFields, status: s },
                            { onError: (e) => onActionError('Estado bancário', e), onSuccess: () => actionToast('Status bancário', s) },
                          );
                        }}
                      >
                        {s.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Timeline</p>
                {eventsQuery.isLoading ? (
                  <Skeleton className="h-24 w-full bg-foreground/10" />
                ) : eventList.length ? (
                  <div className="space-y-2 rounded-lg border border-border/50 bg-background/70 p-2">
                    {eventList.map((ev) => (
                      <div key={`${ev.id}-${ev.created_at}-${ev.correlation_id}`} className="flex items-start gap-2 rounded-md border border-border/40 bg-background/80 px-2 py-2">
                        <span className={`mt-1 h-2 w-2 rounded-full ${toneDot(mapStatusDisplay(ev.status).tone)}`} />
                        <div className="space-y-1 text-[12px]">
                          <div className="flex flex-wrap items-center gap-2 text-foreground">
                            <span className="font-semibold">{ev.type || ev.step || 'evento'}</span>
                            <Badge variant="outline" className="text-[11px]">
                              {ev.status || '—'}
                            </Badge>
                            {ev.correlation_id ? <span className="rounded bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground/70">{ev.correlation_id}</span> : null}
                          </div>
                          <p className="text-foreground/70">{ev.message || ev.created_at || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-[12px] text-foreground/60">Sem eventos ainda.</div>
                )}
              </div>

              {timeline.length ? (
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/60">Timeline bancário/verificación</p>
                  <div className="space-y-2 rounded-lg border border-border/50 bg-background/70 p-2">
                    {timeline.map((ev) => (
                      <div key={`${ev.id}-${ev.created_at}-${ev.correlation_id}-timeline`} className="flex items-start gap-2 rounded-md border border-border/40 bg-background/80 px-2 py-2">
                        <span className={`mt-1 h-2 w-2 rounded-full ${toneDot(mapStatusDisplay(ev.status).tone)}`} />
                        <div className="space-y-1 text-[12px]">
                          <div className="flex flex-wrap items-center gap-2 text-foreground">
                            <span className="font-semibold">{ev.step || ev.type || 'evento'}</span>
                            <Badge variant="outline" className="text-[11px]">
                              {ev.status || '—'}
                            </Badge>
                            {ev.correlation_id ? <span className="rounded bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground/70">{ev.correlation_id}</span> : null}
                          </div>
                          <p className="text-foreground/70">{ev.message || ev.created_at || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="py-6 text-sm text-foreground/60">Selecione um card para ver detalhes.</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
