import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Gauge, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useKpis, useProcessDistribution, useWeeklyActivity } from '@/hooks/use-carla-data';
import { useUiStore } from '@/stores/ui';

export function DashboardPage() {
  const { toast } = useToast();
  const { period } = useUiStore();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs uppercase tracking-wide text-foreground/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Live data · periodo {period?.toUpperCase?.() || 'ISO-WEEK'}
        </div>
        <Badge variant="outline" className="text-[11px]">
          Carla Channels · realtime
        </Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {kpisQuery.isLoading
          ? Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} className="h-28 w-full bg-foreground/10" />)
          : (kpisQuery.data || []).map((kpi) => {
              const delta = typeof kpi.delta === 'number' ? `${kpi.delta > 0 ? '+' : ''}${kpi.delta}%` : kpi.delta || '—';
              const isNegative = delta.startsWith('-');
              return (
                <Card key={kpi.id || kpi.label} className="glass border-border/60 bg-surface text-foreground">
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
                    <p className="text-xs text-foreground/60">{kpi.helper || 'Meta semanal automatizada'}</p>
                  </CardContent>
                </Card>
              );
            })}
        {kpisQuery.isError ? (
          <div className="col-span-full flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <TriangleAlert size={16} /> Falha ao carregar KPIs.
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-accent" />
              Actividad Semanal
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
                  onError('actividad semanal');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-4 text-sm text-foreground/80"
              >
                Reintentar cargar actividad
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
              <p className="text-xs text-foreground/60">Sin datos para el período seleccionado.</p>
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-accent" />
              Distribución de Procesos
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
                  onError('distribución de procesos');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/60 px-3 py-4 text-sm text-foreground/80"
              >
                Reintentar distribución
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
              <p className="text-xs text-foreground/60">Sin procesos registrados para este período.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

