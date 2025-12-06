import { BarChart3, Clock3, Gauge, MessagesSquare, Percent, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const kpis = [
  { label: 'Conversaciones Activas', value: '245', delta: '+12%', icon: MessagesSquare },
  { label: 'Procesos en Curso', value: '167', delta: '+8%', icon: Gauge },
  { label: 'Completados Hoy', value: '93', delta: '+15%', icon: TrendingUp },
  { label: 'SLA Respuesta', value: '24 min', delta: '-5%', icon: Clock3 },
  { label: 'Volumen Diario', value: 'R$ 4,3M', delta: '+18%', icon: Percent },
];

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isNegative = kpi.delta.startsWith('-');
          return (
            <Card key={kpi.label} className="glass border-border/60 bg-surface text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/80">{kpi.label}</CardTitle>
                <Badge variant="outline" className={isNegative ? 'text-red-400 border-red-400/30' : 'text-emerald-300 border-emerald-300/30'}>
                  {kpi.delta}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-2xl font-semibold">
                  <Icon className="h-5 w-5 text-accent" />
                  <span>{kpi.value}</span>
                </div>
                <p className="text-xs text-foreground/60">Meta semanal automatizada</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-accent" />
              Actividad Semanal (mock)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-52 w-full bg-foreground/10" />
            <p className="text-xs text-foreground/60">Placeholder de gráfico stacked bar (Recharts). Filtros: período y proceso.</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/60 bg-surface text-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4 text-accent" />
              Distribución de Procesos (mock)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-52 w-full bg-foreground/10" />
            <p className="text-xs text-foreground/60">Placeholder donut (Recharts). Incluye leyenda y %.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

