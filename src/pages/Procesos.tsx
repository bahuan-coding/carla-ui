import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2 } from 'lucide-react';

const procesos = [
  {
    nombre: 'Apertura de Cuenta de Ahorros',
    estado: 'Activo',
    pasos: 12,
    uso: '234 usos este mes',
    updated: 'Hace 2 horas',
  },
  {
    nombre: 'Solicitud de Crédito Personal',
    estado: 'Activo',
    pasos: 18,
    uso: '156 usos este mes',
    updated: 'Hace 1 día',
  },
  {
    nombre: 'Transferencias Internacionales',
    estado: 'Borrador',
    pasos: 10,
    uso: '42 usos este mes',
    updated: 'Hace 1 semana',
  },
];

const estadoBadge = (estado: string) =>
  estado === 'Activo' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200';

export function ProcesosPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Procesos de WhatsApp</h3>
          <p className="text-sm text-foreground/60">Gestión de flujos automatizados y llamadas a la Banking API.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Link2 size={12} /> Banking API map (futuro)
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {procesos.map((p) => (
          <Card key={p.nombre} className="glass border-border/60 bg-surface p-4 text-foreground space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{p.nombre}</h4>
              <span className={`rounded-full px-2 py-1 text-[11px] ${estadoBadge(p.estado)}`}>{p.estado}</span>
            </div>
            <p className="text-xs text-foreground/60">Pasos: {p.pasos} • {p.updated}</p>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-xs text-foreground/70">
              {p.uso}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[11px]">Editar</Badge>
              <Badge variant="outline" className="text-[11px]">Duplicar</Badge>
              <Badge variant="outline" className="text-[11px]">{p.estado === 'Activo' ? 'Desactivar' : 'Activar'}</Badge>
            </div>
          </Card>
        ))}
        <Skeleton className="h-40 w-full bg-foreground/10" />
      </div>
    </div>
  );
}

