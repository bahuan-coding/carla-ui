import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Cpu, Database, MessageSquare, Radio, Zap } from 'lucide-react';
import { useHealthServices, useKpis, useProcessDistribution, useWeeklyActivity } from '@/hooks/use-carla-data';
import { useUiStore } from '@/stores/ui';

const statusClass = (status?: string) => {
  const text = status?.toLowerCase?.() || '';
  if (/error|down|fail|degrad|blocked/.test(text)) return 'status-dot-error';
  if (!text || /warn|slow|pending|queued/.test(text)) return 'status-dot-warn';
  return 'status-dot-ok';
};

const formatMs = (ms?: number | null) => {
  if (ms === null || ms === undefined) return '—';
  return `${Math.max(ms, 0).toFixed(0)}ms`;
};

export function DashboardPage() {
  const { period } = useUiStore();
  const [showSnapshot, setShowSnapshot] = useState(true);
  const kpisQuery = useKpis(period);
  const weeklyQuery = useWeeklyActivity(period);
  const distributionQuery = useProcessDistribution(period);
  const healthQuery = useHealthServices();

  const weeklyData = useMemo(
    () => (weeklyQuery.data || []).map((point) => ({ label: point.label, ...point.breakdown })),
    [weeklyQuery.data],
  );

  const barKeys = useMemo(() => {
    if (!weeklyData.length) return [];
    const keys = new Set<string>();
    weeklyData.forEach((d) => Object.keys(d).forEach((k) => k !== 'label' && keys.add(k)));
    return Array.from(keys);
  }, [weeklyData]);

  const distribution = distributionQuery.data || [];
  const palette = ['hsl(185 100% 50%)', 'hsl(158 64% 55%)', 'hsl(35 90% 62%)', 'hsl(280 60% 62%)', 'hsl(340 70% 60%)'];

  const healthServices = useMemo(() => {
    const services: { name: string; status?: string; latency?: number | null; icon: typeof Database }[] = [];
    const carlaData = healthQuery.data?.carla;
    const otpData = healthQuery.data?.otp;
    const carlaServices = carlaData?.services || {};
    
    const iconMap: Record<string, typeof Database> = {
      database: Database,
      cache: Zap,
      whatsapp_api: MessageSquare,
      default: Cpu,
    };
    
    Object.entries(carlaServices).forEach(([name, svc]) => {
      services.push({
        name,
        status: svc?.status as string | undefined,
        latency: (svc as { latency_ms?: number | null })?.latency_ms ?? null,
        icon: iconMap[name] || iconMap.default,
      });
    });
    if (otpData) {
      services.push({ name: 'OTP', status: otpData.status, latency: null, icon: Radio });
    }
    return services;
  }, [healthQuery.data]);

  const overallHealth = useMemo(() => {
    if (healthQuery.isError) return { tone: 'error' as const, label: 'Offline' };
    if (!healthQuery.data) return null;
    const statuses = healthServices.map((s) => s.status?.toLowerCase?.() || '');
    const hasError = statuses.some((s) => /error|down|fail|degrad/.test(s));
    const hasWarn = !hasError && statuses.some((s) => !/healthy|operational|connected|ok/.test(s));
    return {
      tone: hasError ? ('error' as const) : hasWarn ? ('warn' as const) : ('ok' as const),
      label: hasError ? 'Critical' : hasWarn ? 'Degraded' : 'Operational',
      metrics: healthQuery.data?.carla?.metrics,
      timestamp: healthQuery.data?.carla?.timestamp || healthQuery.data?.otp?.timestamp,
    };
  }, [healthQuery.data, healthQuery.isError, healthServices]);

  const kpis = kpisQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <header className="relative overflow-hidden rounded-3xl bento-card bg-gradient-to-br from-card via-card to-accent/5 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.1),transparent_60%)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Mission Control</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              Carla<span className="text-accent glow-text">.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Real-time infrastructure monitoring · Core + WhatsApp + Compliance
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <span className={`status-dot ${overallHealth?.tone === 'ok' ? 'status-dot-ok' : overallHealth?.tone === 'warn' ? 'status-dot-warn' : 'status-dot-error'}`} />
              <span className="text-sm font-medium text-foreground">{overallHealth?.label || 'Loading'}</span>
            </div>
            {overallHealth?.metrics?.requests_per_minute && (
              <div className="px-4 py-2 rounded-full bg-card border border-border">
                <span className="font-mono text-sm text-accent">{overallHealth.metrics.requests_per_minute}</span>
                <span className="text-xs text-muted-foreground ml-1">rpm</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bento Grid - KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {kpisQuery.isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bento-card animate-pulse">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </div>
            ))
          : kpis.map((kpi) => {
              const delta = typeof kpi.delta === 'number' ? `${kpi.delta > 0 ? '+' : ''}${kpi.delta}%` : kpi.delta || '—';
              const isPositive = delta.startsWith('+') && delta !== '+0%';
              const isNegative = delta.startsWith('-');
              return (
                <div key={kpi.id || kpi.label} className="bento-card glass-hover group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      isNegative ? 'bg-red-500/10 text-red-400' : isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      {delta}
                    </span>
                  </div>
                  <p className="font-display text-3xl text-foreground group-hover:text-accent transition-colors">{kpi.value}</p>
                  {kpi.helper && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{kpi.helper}</p>}
                </div>
              );
            })}
      </section>

      {/* Bento Grid - Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Services Health - Span 2 */}
        <div className="lg:col-span-2 bento-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">Services</h2>
                <p className="text-xs text-muted-foreground">{healthServices.length} monitored</p>
              </div>
            </div>
            {overallHealth?.timestamp && (
              <span className="text-xs font-mono text-muted-foreground">
                {new Date(overallHealth.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>

          {healthQuery.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {healthServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <div key={svc.name} className="group relative p-4 rounded-xl bg-card/50 border border-border/50 hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="text-sm font-medium text-foreground">{svc.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${statusClass(svc.status)}`} />
                        <span className="text-xs text-muted-foreground">{svc.status || '—'}</span>
                      </div>
                      {svc.latency !== null && (
                        <span className="text-xs font-mono text-accent">{formatMs(svc.latency)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* JSON Snapshot */}
          {showSnapshot && healthQuery.data && (
            <div className="mt-4 p-4 rounded-xl bg-muted/50 dark:bg-black/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">live snapshot</span>
                <button onClick={() => setShowSnapshot(false)} className="text-xs text-muted-foreground hover:text-accent transition-colors">
                  hide
                </button>
              </div>
              <pre className="text-xs font-mono overflow-auto max-h-32 text-foreground/80">
                <code dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    core: healthQuery.data?.carla?.status || '—',
                    otp: healthQuery.data?.otp?.status || '—',
                    services: healthServices.length,
                    rpm: overallHealth?.metrics?.requests_per_minute,
                  }, null, 2)
                    .replace(/(".*?")(?=:)/g, '<span class="text-accent dark:text-cyan-400">$1</span>')
                    .replace(/: "(.*?)"/g, ': <span class="text-sky-600 dark:text-cyan-200">$1</span>')
                    .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600 dark:text-amber-300">$1</span>')
                }} />
              </pre>
            </div>
          )}
          {!showSnapshot && (
            <button onClick={() => setShowSnapshot(true)} className="mt-4 text-xs text-muted-foreground hover:text-accent transition-colors">
              show snapshot →
            </button>
          )}
        </div>

        {/* Distribution Pie */}
        <div className="bento-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Processes</h2>
              <p className="text-xs text-muted-foreground">Distribution</p>
            </div>
          </div>
          {distributionQuery.isLoading ? (
            <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
          ) : distribution.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {distribution.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(228 18% 9%)', border: '1px solid hsl(228 14% 18%)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {distribution.slice(0, 4).map((d, i) => (
              <span key={d.name} className="text-xs px-2 py-1 rounded-full bg-card border border-border" style={{ borderColor: palette[i % palette.length] + '40' }}>
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Chart */}
      <section className="bento-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Activity Trend</h2>
              <p className="text-xs text-muted-foreground">Operations over time</p>
            </div>
          </div>
        </div>
        {weeklyQuery.isLoading ? (
          <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
        ) : weeklyData.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid stroke="hsl(228 14% 18%)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'hsl(220 12% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(220 12% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(228 18% 9%)', border: '1px solid hsl(228 14% 18%)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(0, 240, 255, 0.05)' }}
              />
              {barKeys.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="a" fill={palette[i % palette.length]} radius={i === barKeys.length - 1 ? [6, 6, 0, 0] : 0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No activity data</div>
        )}
      </section>
    </div>
  );
}
