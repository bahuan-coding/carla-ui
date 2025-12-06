import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock4, Filter } from 'lucide-react';

const rows = [
  {
    cliente: 'Juan Pérez',
    proceso: 'Solicitud de Crédito',
    etapa: 'Documentación',
    progreso: 60,
    tiempo: '1h 23m',
    prioridad: 'Alta',
    tag: 'Crédito',
  },
  {
    cliente: 'María García',
    proceso: 'Apertura de Cuenta',
    etapa: 'KYC',
    progreso: 40,
    tiempo: '1h 08m',
    prioridade: 'Media',
    tag: 'Cuenta',
  },
  {
    cliente: 'Carlos López',
    proceso: 'Apertura de Cuenta',
    etapa: 'Aprobación',
    progreso: 85,
    tiempo: '53m',
    prioridade: 'Baja',
    tag: 'Cuenta',
  },
];

const prioridadColor = (p?: string) => {
  if (p === 'Alta') return 'bg-red-500/15 text-red-200';
  if (p === 'Media') return 'bg-amber-500/15 text-amber-200';
  return 'bg-emerald-500/15 text-emerald-200';
};

export function TransaccionesPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Transacciones</h3>
          <p className="text-sm text-foreground/60">Seguimiento de procesos activos y conversaciones en flujo.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Filter size={12} /> Filtros (mock)
        </Badge>
      </div>
      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
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
            {rows.map((row) => (
              <TableRow key={row.cliente} className="hover:bg-foreground/5">
                <TableCell className="font-semibold">{row.cliente}</TableCell>
                <TableCell className="text-sm">{row.proceso}</TableCell>
                <TableCell className="text-sm text-foreground/70">{row.etapa}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-foreground/10">
                      <div className="h-full bg-accent" style={{ width: `${row.progreso}%` }} />
                    </div>
                    <span className="text-xs text-foreground/70">{row.progreso}%</span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-1 text-sm text-foreground/80">
                  <Clock4 size={14} className="text-accent" /> {row.tiempo}
                </TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-1 text-[11px] ${prioridadColor(row.prioridad)}`}>{row.prioridad || 'Baja'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[11px]">
                    {row.tag}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

