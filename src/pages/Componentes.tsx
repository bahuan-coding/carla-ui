import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Workflow,
  Wallet,
  CreditCard,
  Globe,
  Clock,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  Archive,
  Play,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFlows, useCreateFlow, useDeleteFlow } from '@/hooks/use-flows';
import { useToast } from '@/hooks/use-toast';
import { FlowEditor } from '@/components/FlowEditor';
import type { WhatsAppFlow } from '@/types/flow';

const iconMap: Record<string, React.ElementType> = {
  workflow: Workflow,
  wallet: Wallet,
  'credit-card': CreditCard,
  globe: Globe,
};

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  
  if (diffHours < 1) return 'Hace unos minutos';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffWeeks === 1) return 'Hace 1 semana';
  return `Hace ${diffWeeks} semanas`;
};

export function ComponentesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFlowId, setSelectedFlowId] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: flows = [], isLoading, refetch } = useFlows();
  const createFlow = useCreateFlow();
  const deleteFlow = useDeleteFlow();

  // Normalize text for search (remove accents)
  const normalizeText = (text: string) => 
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Local filtering for search
  const filteredFlows = useMemo(() => {
    if (!debouncedSearch.trim()) return flows;
    const search = normalizeText(debouncedSearch);
    return flows.filter(f => 
      normalizeText(f.name).includes(search) || 
      normalizeText(f.description || '').includes(search)
    );
  }, [flows, debouncedSearch]);

  const handleCreateFlow = async () => {
    try {
      const newFlow = await createFlow.mutateAsync({
        name: 'Nuevo Proceso',
        description: 'Describe el propósito de este flujo',
        status: 'draft',
        icon: 'workflow',
      });
      setSelectedFlowId(newFlow.id);
      toast({ title: 'Proceso creado', description: 'Puedes comenzar a configurar tu flujo' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el proceso' });
    }
  };

  const handleDeleteFlow = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteFlow.mutateAsync(id);
      toast({ title: 'Proceso eliminado' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el proceso' });
    }
  };

  const handleDuplicate = async (flow: WhatsAppFlow) => {
    try {
      await createFlow.mutateAsync({
        name: `${flow.name} (copia)`,
        description: flow.description || '',
        status: 'draft',
        icon: flow.icon,
        config: flow.config,
      });
      toast({ title: 'Proceso duplicado' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo duplicar el proceso' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Procesos de WhatsApp</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona y visualiza todos tus flujos automatizados
          </p>
        </div>
        <Button 
          onClick={handleCreateFlow}
          disabled={createFlow.isPending}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 h-11 shadow-lg shadow-emerald-600/20"
        >
          <Plus size={18} />
          Nuevo Proceso
        </Button>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          placeholder="Buscar procesos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500/50"
        />
      </div>

      {/* Flow Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/30 bg-card/50 p-5">
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))
          : filteredFlows.map((flow) => {
              const IconComponent = iconMap[flow.icon] || Workflow;
              const isActive = flow.status === 'active';
              const isDraft = flow.status === 'draft';

              return (
                <article
                  key={flow.id}
                  className="group rounded-2xl border border-border/30 bg-card/50 p-5 hover:border-border/60 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header: Icon + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <IconComponent size={24} className="text-emerald-600" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : isDraft
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {isActive ? 'Activo' : isDraft ? 'Borrador' : 'Archivado'}
                    </span>
                  </div>

                  {/* Title + Description */}
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{flow.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                    {flow.description || 'Sin descripción'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Workflow size={14} />
                      {flow.steps_count} pasos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatRelativeTime(flow.updated_at)}
                    </span>
                  </div>

                  {/* Usage Bar - only for active flows with usage */}
                  {isActive && flow.usage_count > 0 && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 flex items-center gap-2">
                      <Play size={14} className="text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {flow.usage_count} usos este mes
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 rounded-xl h-10"
                      onClick={() => setSelectedFlowId(flow.id)}
                    >
                      <Edit3 size={14} />
                      Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleDuplicate(flow)}>
                          <Copy size={14} className="mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive size={14} className="mr-2" />
                          {flow.status === 'archived' ? 'Restaurar' : 'Archivar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteFlow(flow.id, flow.name)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </article>
              );
            })}
      </div>

      {/* Empty State */}
      {!isLoading && flows.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Workflow size={36} className="text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Sin procesos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? 'No hay procesos que coincidan con tu búsqueda' : 'Crea tu primer flujo de WhatsApp'}
          </p>
          {!search && (
            <Button onClick={handleCreateFlow} className="gap-2">
              <Plus size={16} />
              Crear proceso
            </Button>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2 text-muted-foreground">
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {/* Flow Editor Sheet */}
      <Sheet open={Boolean(selectedFlowId)} onOpenChange={(open) => !open && setSelectedFlowId(undefined)}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
          {selectedFlowId && (
            <FlowEditor
              flowId={selectedFlowId}
              onClose={() => setSelectedFlowId(undefined)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

