import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcesses } from '@/hooks/use-carla-data';
import { Link2, RefreshCw } from 'lucide-react';

const estadoBadge = (estado: string) =>
  estado.toLowerCase() === 'activo' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200';

export function ProcesosPage() {
  const [search, setSearch] = useState('');
  const procesosQuery = useProcesses(search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Procesos de WhatsApp</h3>
          <p className="text-sm text-foreground/60">Gestión de flujos automatizados y llamadas a la Banking API.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Link2 size={12} /> Banking API map
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => procesosQuery.refetch()}>
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      <Input
        placeholder="Buscar por nombre/estado"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md text-sm"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {procesosQuery.isLoading
          ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-40 w-full bg-foreground/10" />)
          : (procesosQuery.data || []).map((p) => (
              <Card key={p.id} className="glass border-border/60 bg-surface p-4 text-foreground space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{p.nombre}</h4>
                  <span className={`rounded-full px-2 py-1 text-[11px] ${estadoBadge(p.estado)}`}>{p.estado}</span>
                </div>
                <p className="text-xs text-foreground/60">
                Pasos: {p.pasos ?? '—'} • {p.updated || '—'} • Uso: {p.uso || '—'}
                </p>
              <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-xs text-foreground/70">
                {p.uso || 'Sin descripción — mapear al flujo Carla Channels/Banking.'}
              </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[11px]">
                    Editar
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    Duplicar
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {p.estado.toLowerCase() === 'activo' ? 'Desactivar' : 'Activar'}
                  </Badge>
                </div>
              </Card>
            ))}
        {procesosQuery.isError ? (
          <p className="col-span-full text-xs text-destructive">No se pudo cargar procesos.</p>
        ) : null}
        {!procesosQuery.isLoading && !(procesosQuery.data || []).length ? (
          <p className="col-span-full text-xs text-foreground/60">Sin procesos para este filtro.</p>
        ) : null}
      </div>
    </div>
  );
}

