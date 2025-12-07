import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertCircle, BarChart3, Gauge, MessagesSquare, RefreshCw, ShieldCheck, TriangleAlert, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useKpis, useProcessDistribution, useWeeklyActivity } from '@/hooks/use-carla-data';
import { useUiStore } from '@/stores/ui';

export function DashboardPage() {
  const { toast } = useToast();
  const { period } = useUiStore();
  const [ambiente, setAmbiente] = useState<'prod' | 'homol'>('prod');
  const kpisQuery = useKpis(period);
  const weeklyQuery = useWeeklyActivity(period);
  const distributionQuery = useProcessDistribution(period);

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

  const onError = (label: string, error?: unknown) =>
    toast({
      title: `Erro ao cargar ${label}`,
      description: error instanceof Error ? error.message : 'Reintente en unos segundos.',
      variant: 'destructive',
    });

  const refreshAll = () => {
    kpisQuery.refetch();
    weeklyQuery.refetch();
    distributionQuery.refetch();
  };

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

  const healthStatuses = [
    {
      label: 'KPIs core',
      status: kpisQuery.isError ? 'Erro' : kpisQuery.isLoading ? 'Carregando' : 'Estável',
      tone: kpisQuery.isError ? 'error' : 'ok',
      helper: 'Fonte /dashboard/kpis',
    },
    {
      label: 'Atividade semanal',
      status: weeklyQuery.isError ? 'Erro' : weeklyData.length ? 'OK' : 'Sem dados',
      tone: weeklyQuery.isError ? 'error' : weeklyData.length ? 'ok' : 'warn',
      helper: 'Fluxos e contas por período',
    },
    {
      label: 'Distribuição de processos',
      status: distributionQuery.isError ? 'Erro' : distribution.length ? 'OK' : 'Sem dados',
      tone: distributionQuery.isError ? 'error' : distribution.length ? 'ok' : 'warn',
      helper: 'Mix por fluxo WhatsApp/core',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border/40 bg-surface/70 px-4 py-3">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/60">Mission Control · Infra WhatsApp + Core</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs text-accent border-accent/30">
              Ambiente: {ambiente === 'prod' ? 'Produção' : 'Homologação'}
            </Badge>
            <Badge variant="outline" className="text-xs border-border/60 text-foreground/70">
              Instituições: Todas
            </Badge>
            <Badge variant="outline" className="text-xs border-border/60 text-foreground/70">
              Período: {period?.toUpperCase?.() || 'ISO-WEEK'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-[11px] border-emerald-400/40 text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live
          </Badge>
          <Badge variant="outline" className="text-[11px]">Carla Channels</Badge>
          <button
            type="button"
            onClick={refreshAll}
            className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground/80 transition hover:border-accent/50 hover:text-accent"
          >
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">KPIs críticos</h3>
            <p className="text-xs text-foreground/60">Saúde da infra (core + WhatsApp + compliance)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAmbiente(ambiente === 'prod' ? 'homol' : 'prod')}
              className="rounded-lg border border-border/60 bg-background/60 px-3 py-1 text-[11px] text-foreground/70 transition hover:border-accent/60 hover:text-accent"
            >
              Alternar ambiente
            </button>
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
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Saúde de integrações
            </CardTitle>
            <Badge variant="outline" className="text-[11px] border-border/60 text-foreground/70">
              Core banking · AML/KYC · Assinatura
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              {healthStatuses.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/50 bg-background/60 px-3 py-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/70">{item.label}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        item.tone === 'error'
                          ? 'bg-destructive/15 text-destructive'
                          : item.tone === 'warn'
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-emerald-500/15 text-emerald-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-foreground/60">{item.helper}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground/60">
              <Activity size={14} className="text-accent" /> Monitorar SLA de APIs e filas de eventos.
            </div>
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

