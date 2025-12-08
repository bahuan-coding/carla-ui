import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/hooks/use-carla-data';
import { AlertTriangle, Clock4, Filter, RefreshCw } from 'lucide-react';

const prioridadColor = (p?: string) => {
  if (p?.toLowerCase() === 'alta') return 'bg-red-500/15 text-red-200';
  if (p?.toLowerCase() === 'media') return 'bg-amber-500/15 text-amber-200';
  return 'bg-emerald-500/15 text-emerald-200';
};

export function TransaccionesPage() {
  const [search, setSearch] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const transactionsQuery = useTransactions({ q: search || undefined, prioridad: prioridad || undefined });

  const filtered = useMemo(() => transactionsQuery.data || [], [transactionsQuery.data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Transacciones</h3>
          <p className="text-sm text-foreground/60">Seguimiento de procesos activos y conversaciones en flujo.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Filter size={12} /> Filtros
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => transactionsQuery.refetch()}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Buscar cliente/proceso"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
          id="transactions-search"
          name="transactions-search"
        />
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          id="transactions-priority"
          name="transactions-priority"
        >
          <option value="">Prioridad</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
        {transactionsQuery.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full bg-foreground/10" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} className="hover:bg-foreground/5">
                  <TableCell className="font-semibold">{row.cliente}</TableCell>
                  <TableCell className="text-sm">{row.proceso}</TableCell>
                  <TableCell className="text-sm text-foreground/70">{row.etapa || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-foreground/10">
                        <div className="h-full bg-accent" style={{ width: `${row.progreso ?? 0}%` }} />
                      </div>
                      <span className="text-xs text-foreground/70">{row.progreso ?? 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1 text-sm text-foreground/80">
                    <Clock4 size={14} className="text-accent" /> {row.tiempo || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-[11px] ${prioridadColor(row.prioridad)}`}>{row.prioridad || 'Baja'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px]">
                        {row.tag || '—'}
                      </Badge>
                      {row.slaBreached ? (
                        <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 text-[11px] text-destructive">
                          <AlertTriangle size={12} /> SLA
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-foreground/60">
                    Sin transacciones para este filtro.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
        {transactionsQuery.isError ? (
          <p className="px-4 py-3 text-xs text-destructive">No se pudo cargar transacciones.</p>
        ) : null}
      </Card>
    </div>
  );
}

