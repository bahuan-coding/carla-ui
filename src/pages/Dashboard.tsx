import { useMemo, useState } from 'react';
import { MessagesSquare, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHealthServices, useKpis, useProcessDistribution } from '@/hooks/use-carla-data';
import { useUiStore } from '@/stores/ui';

const toneBadge = (tone: 'ok' | 'warn' | 'error') =>
  tone === 'error'
    ? 'bg-red-100 text-red-700'
    : tone === 'warn'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';

const statusTone = (status?: string) => {
  const text = status?.toLowerCase?.() || '';
  if (/error|down|fail|degrad|blocked/.test(text)) return 'error';
  if (!text || /warn|slow|pending|queued/.test(text)) return 'warn';
  return 'ok';
};

const formatMs = (ms?: number | null) => {
  if (ms === null || ms === undefined) return '—';
  return `${Math.max(ms, 0).toFixed(0)} ms`;
};

export function DashboardPage() {
  const { period } = useUiStore();
  const [showSnapshot, setShowSnapshot] = useState(true);
  const kpisQuery = useKpis(period);
  const distributionQuery = useProcessDistribution(period);
  const healthQuery = useHealthServices();

  const distribution = distributionQuery.data || [];

  const prioritizedKpis = useMemo(() => {
    const data = kpisQuery.data || [];
    const order = ['aberturas', 'complet', 'mens', 'erro', 'fila', 'whatsapp'];
    const scored = data
      .map((kpi) => {
        const key = kpi.label.toLowerCase();
        const score = order.findIndex((o) => key.includes(o));
        return { ...kpi, score: score === -1 ? 99 : score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
    if (scored.length) return scored;
    return data.slice(0, 6);
  }, [kpisQuery.data]);

  const healthServices = useMemo(() => {
    const carlaData = healthQuery.data?.carla;
    const otpData = healthQuery.data?.otp;
    const services = Object.entries(carlaData?.services || {}).map(([name, svc]) => ({
      name,
      status: svc?.status as string | undefined,
      env: carlaData?.environment,
      latency: (svc as { latency_ms?: number | null })?.latency_ms ?? null,
      timestamp: carlaData?.timestamp,
    }));
    const whatsappOnly = services.filter((s) => s.name.toLowerCase().includes('whatsapp'));
    const otpAsWhatsapp = otpData
      ? [
          {
            name: otpData.service || 'otp',
            status: otpData.status,
            env: otpData.environment,
            latency: null,
            timestamp: otpData.timestamp,
          },
        ]
      : [];
    return [...whatsappOnly, ...otpAsWhatsapp].slice(0, 2);
  }, [healthQuery.data]);

  const snapshotTimestamp =
    healthQuery.data?.carla?.timestamp || healthQuery.data?.otp?.timestamp || new Date().toISOString();
  const servicesCount = healthServices.length || 0;
  const responseMs = healthQuery.data?.carla?.metrics?.average_response_time_ms;
  const whatsappFlows = distribution.length || 0;
  const messagesKpi = (kpisQuery.data || []).find((k) => k.label.toLowerCase().includes('mens'));

  return (
    <div className="flex flex-col gap-6 bg-[#f5f5f7] px-1 py-1 sm:px-0">
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">KPIs críticos</h2>
          <p className="text-sm text-slate-500">Saúde da infra + WhatsApp + compliance</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {kpisQuery.isLoading
            ? Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} className="h-28 w-full bg-slate-200/60" />)
            : prioritizedKpis.map((kpi) => {
                const delta =
                  typeof kpi.delta === 'number' ? `${kpi.delta > 0 ? '+' : ''}${kpi.delta}%` : kpi.delta || '—';
                const isNegative = delta.startsWith('-');
                return (
                  <Card key={kpi.id || kpi.label} className="h-full border border-slate-200/70 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-800">{kpi.label}</CardTitle>
                      <Badge variant="outline" className={isNegative ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-700'}>
                        {delta}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-2xl font-semibold">
                        <span className="text-indigo-600">{kpi.value}</span>
                      </div>
                      <p className="text-xs text-slate-500">{kpi.helper || 'Últimos 7 dias'}</p>
                    </CardContent>
                  </Card>
                );
              })}
          {kpisQuery.isError ? (
            <div className="col-span-full flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Falha ao carregar KPIs.
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border border-slate-200/70 bg-white text-foreground shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-900">Saúde dos serviços</CardTitle>
            <span className="text-[11px] text-slate-500">whatsapp_api e relacionados</span>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthQuery.isLoading ? (
              <Skeleton className="h-36 w-full bg-slate-200/60" />
            ) : (
              <>
                <div className="space-y-3">
                  {healthServices.length ? (
                    healthServices.map((service) => (
                      <div key={service.name} className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          <span className="text-slate-800">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className={`rounded-full px-2 py-1 ${toneBadge(statusTone(service.status))}`}>{service.status || '—'}</span>
                          <span className="text-slate-500">{formatMs(service.latency)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      Aguardando heartbeat WhatsApp/API.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200/70 bg-slate-50 p-3 text-[11px] font-mono text-slate-700 shadow-inner">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Snapshot vivo</span>
                    <button
                      type="button"
                      onClick={() => setShowSnapshot((prev) => !prev)}
                      className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      {showSnapshot ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {showSnapshot ? (
                    <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-white px-3 py-2 leading-relaxed text-[11px] text-slate-800">
                      <code
                        className="[color-scheme:dark] block text-[11px] leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: JSON.stringify(
                            {
                              core: healthQuery.data?.carla?.status || '—',
                              otp: healthQuery.data?.otp?.status || '—',
                              services: servicesCount,
                              timestamp: snapshotTimestamp || '—',
                            },
                            null,
                            2,
                          )
                            .replace(/(&)/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/(".*?")(?=:)/g, '<span class="text-indigo-500">$1</span>')
                            .replace(/: "(.*?)"/g, ': <span class="text-sky-600">$1</span>')
                            .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600">$1</span>')
                            .replace(/null/g, '<span class="text-slate-500">null</span>'),
                        }}
                      />
                    </pre>
                  ) : (
                    <div className="rounded-md border border-dashed border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                      Telemetria em buffer. Clique para rearmar o snapshot vivo.
                    </div>
                  )}
                </div>
              </>
            )}
            {healthQuery.isError ? (
              <div className="col-span-full flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Falha ao consultar health. Tente novamente.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/70 bg-white text-foreground shadow-sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessagesSquare className="h-4 w-4 text-indigo-600" />
              Canal WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Fluxos ativos</p>
                <p className="text-lg font-semibold text-indigo-600">{whatsappFlows || '—'}</p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Mensagens</p>
                <p className="text-lg font-semibold text-slate-800">{messagesKpi?.value ?? '—'}</p>
                <p className="text-[11px] text-slate-500">últimos 7d</p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Tempo médio resposta</p>
                <p className="text-lg font-semibold text-slate-800">{responseMs ? `${Math.round(responseMs)} ms` : '—'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-50 px-3 py-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Entrega por fluxo</span>
                <span className="text-[11px] text-slate-500">{whatsappFlows ? `${whatsappFlows} fluxos` : 'Sem dados'}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.min(whatsappFlows * 12, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Wifi size={14} className="text-indigo-500" /> Entregabilidade e tempo dos bots monitorados por período.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="pb-6 text-xs text-slate-500">
        <p>
          Removidos database/cache, rótulos redundantes, tendência/alertas/eventos. KPIs priorizados conforme API; saúde focada em whatsapp_api; paleta neutra para evitar poluição visual.
        </p>
      </section>
    </div>
  );
}
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertCircle, BarChart3, Gauge, MessagesSquare, TriangleAlert, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useHealthServices, useKpis, useProcessDistribution, useWeeklyActivity } from '@/hooks/use-carla-data';
import { useUiStore } from '@/stores/ui';

export function DashboardPage() {
  const { toast } = useToast();
  const { period } = useUiStore();
  const [showSnapshot, setShowSnapshot] = useState(true);
  const kpisQuery = useKpis(period);
  const weeklyQuery = useWeeklyActivity(period);
  const distributionQuery = useProcessDistribution(period);
  const healthQuery = useHealthServices();

  const weeklyData = useMemo(
    () =>
      (weeklyQuery.data || []).map((point) => ({
        label: point.label,
        ...point.breakdown,
      })),
    [weeklyQuery.data],
  );

  const barKeys = useMemo(() => {
    if (!weeklyData.length) return [];
    const keys = new Set<string>();
    weeklyData.forEach((d) => {
      Object.keys(d).forEach((k) => {
        if (k !== 'label') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [weeklyData]);

  const distribution = distributionQuery.data || [];
  const palette = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const healthServices = useMemo(() => {
    const services: { name: string; status?: string; env?: string; latency?: number | null; pool?: { active?: number | null; max?: number | null }; type?: string | null }[] = [];
    const carlaData = healthQuery.data?.carla;
    const otpData = healthQuery.data?.otp;
    const carlaServices = carlaData?.services || {};
    Object.entries(carlaServices).forEach(([name, svc]) => {
      services.push({
        name,
        status: svc?.status as string | undefined,
        env: carlaData?.environment,
        latency: (svc as { latency_ms?: number | null })?.latency_ms ?? null,
        pool: (svc as { connection_pool?: { active?: number | null; max?: number | null } })?.connection_pool ?? undefined,
        type: (svc as { type?: string | null })?.type ?? null,
      });
    });
    if (otpData) {
      services.push({
        name: otpData.service || 'OTP',
        status: otpData.status,
        env: otpData.environment,
        latency: null,
      });
    }
    return services;
  }, [healthQuery.data]);

  const overallHealth = useMemo(() => {
    if (healthQuery.isError) {
      return { tone: 'error' as const, label: 'Erro ao consultar health', helper: 'Retente em instantes.' };
    }
    if (!healthQuery.data) return null;
    const carlaData = healthQuery.data?.carla;
    const otpData = healthQuery.data?.otp;
    const statuses = healthServices.map((s) => s.status?.toLowerCase?.() || '');
    const hasError = statuses.some((s) => /error|down|fail|degrad/.test(s));
    const hasWarn = !hasError && statuses.some((s) => !/healthy|operational|connected|ok/.test(s));
    const tone = hasError ? ('error' as const) : hasWarn ? ('warn' as const) : ('ok' as const);
    const label = hasError ? 'Alerta crítico' : hasWarn ? 'Atenção aos serviços' : 'Tudo verde';
    return {
      tone,
      label,
      helper: hasError ? 'Priorizar mitigação agora' : hasWarn ? 'Monitorando latência e fila' : 'Monitorando uptime e latência',
      uptime: carlaData?.uptime_seconds,
      timestamp: carlaData?.timestamp || otpData?.timestamp,
      metrics: carlaData?.metrics,
    };
  }, [healthQuery.data, healthQuery.isError, healthServices]);

  const statusSummary = useMemo(() => {
    const coreStatus = healthQuery.data?.carla?.status;
    const otpStatus = healthQuery.data?.otp?.status;
    const coreServicesCount = Object.keys(healthQuery.data?.carla?.services || {}).length;
    const servicesCount = coreServicesCount + (otpStatus ? 1 : 0);
    const hasHeartbeat = Boolean(coreStatus || otpStatus || servicesCount);

    const headline =
      !hasHeartbeat
        ? 'Aguardando heartbeat'
        : overallHealth?.tone === 'error'
          ? 'Intervenção imediata'
          : overallHealth?.tone === 'warn'
            ? 'Monitorando sinais'
            : 'Infra em alta';

    const body = hasHeartbeat
      ? `${servicesCount} serviços · Core ${coreStatus || '—'} · OTP ${otpStatus || '—'}`
      : 'Sem heartbeat ainda. Aguardando OTP/Core.';

    return { headline, body, coreStatus, otpStatus, servicesCount, hasHeartbeat };
  }, [healthQuery.data, overallHealth?.tone]);

  const toneBadge = (tone: 'ok' | 'warn' | 'error') =>
    tone === 'error'
      ? 'bg-destructive/15 text-destructive'
      : tone === 'warn'
        ? 'bg-amber-500/15 text-amber-200'
        : 'bg-emerald-500/15 text-emerald-200';

  const statusTone = (status?: string) => {
    const text = status?.toLowerCase?.() || '';
    if (/error|down|fail|degrad|blocked/.test(text)) return 'error';
    if (!text || /warn|slow|pending|queued/.test(text)) return 'warn';
    return 'ok';
  };

  const formatMs = (ms?: number | null) => {
    if (ms === null || ms === undefined) return '—';
    return `${Math.max(ms, 0).toFixed(0)} ms`;
  };

  const onError = (label: string, error?: unknown) =>
    toast({
      title: `Erro ao cargar ${label}`,
      description: error instanceof Error ? error.message : 'Reintente en unos segundos.',
      variant: 'destructive',
    });

  const alerts = useMemo(() => {
    const list: { label: string; helper?: string; severity: 'high' | 'medium' | 'ok' }[] = [];
    if (kpisQuery.isError || weeklyQuery.isError || distributionQuery.isError) {
      list.push({ label: 'Falha ao sincronizar dados de operação', helper: 'Verificar integrações core/WhatsApp', severity: 'high' });
    }
    (kpisQuery.data || []).forEach((kpi) => {
      const deltaValue =
        typeof kpi.delta === 'number'
          ? kpi.delta
          : Number.parseFloat((kpi.delta || '').toString().replace('%', ''));
      if (!Number.isNaN(deltaValue) && deltaValue < 0) {
        list.push({ label: `${kpi.label}: tendência negativa`, helper: kpi.helper, severity: 'medium' });
      }
    });
    if (!weeklyData.length) {
      list.push({ label: 'Sem atividade recente', helper: 'Monitorar filas e bots', severity: 'medium' });
    }
    if (!distribution.length) {
      list.push({ label: 'Distribuição de processos vazia', helper: 'Mapear fluxos ativos por WhatsApp/core', severity: 'medium' });
    }
    if (!list.length) {
      list.push({ label: 'Sem alertas críticos', helper: 'Monitorando fluxos, AML/KYC e assinaturas', severity: 'ok' });
    }
    return list.slice(0, 4);
  }, [distribution.length, distributionQuery.isError, kpisQuery.data, kpisQuery.isError, weeklyData.length, weeklyQuery.isError]);

  const recentEvents = useMemo(
    () =>
      weeklyData.slice(-4).map((point) => ({
        label: point.label,
        total: Object.entries(point)
          .filter(([k]) => k !== 'label')
          .reduce((acc, [, val]) => acc + Number(val || 0), 0),
      })),
    [weeklyData],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">KPIs críticos</h3>
            <p className="text-xs text-foreground/60">Saúde da infra (core + WhatsApp + compliance)</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {kpisQuery.isLoading
            ? Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} className="h-28 w-full bg-foreground/10" />)
            : (kpisQuery.data || []).map((kpi) => {
                const delta =
                  typeof kpi.delta === 'number' ? `${kpi.delta > 0 ? '+' : ''}${kpi.delta}%` : kpi.delta || '—';
                const isNegative = delta.startsWith('-');
                return (
                  <Card key={kpi.id || kpi.label} className="glass h-full border-border/60 bg-surface text-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-foreground/80">{kpi.label}</CardTitle>
                      <Badge variant="outline" className={isNegative ? 'text-red-400 border-red-400/30' : 'text-emerald-300 border-emerald-300/30'}>
                        {delta}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-2xl font-semibold">
                        <span className="text-accent">{kpi.value}</span>
                      </div>
                      <p className="text-xs text-foreground/60">{kpi.helper || 'Operação em tempo real'}</p>
                    </CardContent>
                  </Card>
                );
              })}
          {kpisQuery.isError ? (
            <div className="col-span-full flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <TriangleAlert size={16} /> Falha ao carregar KPIs.
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Saúde dos serviços</CardTitle>
            <span className="text-[11px] text-foreground/60">{statusSummary.servicesCount || 0} serviços monitorados</span>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthQuery.isLoading ? (
              <Skeleton className="h-48 w-full bg-foreground/10" />
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {healthServices.length ? (
                    healthServices.map((service) => {
                      const showLatency = service.latency !== null && service.latency !== undefined;
                      return (
                        <div key={service.name} className="rounded-lg border border-border/50 bg-background/70 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-accent" />
                              <span className="text-foreground/80">{service.name}</span>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[11px] ${toneBadge(statusTone(service.status))}`}>{service.status || '—'}</span>
                          </div>
                          {showLatency ? (
                            <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/60">
                              <span>Latência {formatMs(service.latency)}</span>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full rounded-lg border border-border/50 bg-background/60 px-3 py-3 text-sm text-foreground/70">
                      Nenhum serviço reportando ainda. Aguardando heartbeat OTP/Core.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border/60 bg-gradient-to-br from-background/85 via-surface to-background/85 p-3 text-[11px] font-mono text-foreground/80 shadow-inner">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-foreground/60">
                    <span>Snapshot vivo</span>
                    <button
                      type="button"
                      onClick={() => setShowSnapshot((prev) => !prev)}
                      className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-foreground/70 transition hover:border-accent/50 hover:text-accent"
                    >
                      {showSnapshot ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {showSnapshot ? (
                    <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-border/50 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.06),transparent),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.06),transparent)] px-3 py-2 leading-relaxed text-[11px] text-foreground">
                      <code
                        className="[color-scheme:dark] block text-[11px] leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: JSON.stringify(
                            {
                              core: healthQuery.data?.carla?.status || '—',
                              otp: healthQuery.data?.otp?.status || '—',
                              services: statusSummary.servicesCount,
                              timestamp: overallHealth?.timestamp || '—',
                            },
                            null,
                            2,
                          )
                            .replace(/(&)/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/(".*?")(?=:)/g, '<span class=\"text-accent\">$1</span>')
                            .replace(/: "(.*?)"/g, ': <span class="text-sky-200">$1</span>')
                            .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-200">$1</span>')
                            .replace(/null/g, '<span class="text-foreground/60">null</span>'),
                        }}
                      />
                    </pre>
                  ) : (
                    <div className="rounded-md border border-dashed border-border/50 bg-background/70 px-3 py-2 text-[11px] text-foreground/70">
                      Telemetria em buffer. Clique para rearmar o snapshot vivo.
                    </div>
                  )}
                </div>
              </>
            )}
            {healthQuery.isError ? (
              <div className="col-span-full flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <TriangleAlert size={16} /> Falha ao consultar health. Tente novamente.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessagesSquare className="h-4 w-4 text-accent" />
              Canal WhatsApp
            </CardTitle>
            <Badge variant="outline" className="text-[11px] border-border/60 text-foreground/70">
              Fluxos ativos e estabilidade
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-background/60 px-3 py-3 text-sm text-foreground/80">
              <div className="flex items-center justify-between">
                <span>Distribuição por fluxo</span>
                <span className="text-[11px] text-foreground/60">{distribution.length ? `${distribution.length} fluxos` : 'Sem dados'}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${Math.min(distribution.length * 12, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <Wifi size={14} className="text-accent" /> Entregabilidade e tempo de resposta dos bots monitorados por período.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-accent" />
              Tendência de operações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyQuery.isLoading ? (
              <Skeleton className="h-52 w-full bg-foreground/10" />
            ) : weeklyQuery.isError ? (
              <button
                type="button"
                onClick={() => {
                  weeklyQuery.refetch();
                  onError('atividade semanal');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-4 text-sm text-foreground/80"
              >
                Recarregar tendência
              </button>
            ) : weeklyData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#0c1428', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  {barKeys.map((key, idx) => (
                    <Bar key={key} dataKey={key} stackId="activity" fill={palette[idx % palette.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-foreground/60">Sem dados para o período selecionado.</p>
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-accent" />
              Distribuição de processos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {distributionQuery.isLoading ? (
              <Skeleton className="h-52 w-full bg-foreground/10" />
            ) : distributionQuery.isError ? (
              <button
                type="button"
                onClick={() => {
                  distributionQuery.refetch();
                  onError('distribuição de processos');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-4 text-sm text-foreground/80"
              >
                Recarregar distribuição
              </button>
            ) : distribution.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {distribution.map((_, idx) => (
                      <Cell key={idx} fill={palette[idx % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0c1428', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-foreground/60">Sem processos para este período.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-300" />
              Alertas & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div
                  key={`${alert.label}-${idx}`}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{alert.label}</p>
                    {alert.helper ? <p className="text-[11px] text-foreground/60">{alert.helper}</p> : null}
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] ${
                      alert.severity === 'high'
                        ? 'bg-destructive/15 text-destructive'
                        : alert.severity === 'medium'
                          ? 'bg-amber-500/15 text-amber-200'
                          : 'bg-emerald-500/15 text-emerald-200'
                    }`}
                  >
                    {alert.severity === 'high' ? 'Crítico' : alert.severity === 'medium' ? 'Atenção' : 'OK'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4 text-accent" />
              Eventos recentes
            </CardTitle>
            <Badge variant="outline" className="text-[11px] border-border/60 text-foreground/70">
              Drill-down para detalhes
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <div key={event.label} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="font-semibold">{event.label}</span>
                  </div>
                  <span className="text-xs text-foreground/70">{event.total} eventos</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-foreground/60">Sem eventos recentes para este período.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

