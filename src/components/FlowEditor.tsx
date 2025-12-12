import { useState } from 'react';
import {
  X,
  Save,
  Play,
  Plus,
  GripVertical,
  MessageSquare,
  HelpCircle,
  Webhook,
  GitBranch,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFlow, useUpdateFlow, useFlowSteps, useCreateStep, useDeleteStep, useUpdateStep } from '@/hooks/use-flows';
import { useToast } from '@/hooks/use-toast';
import type { StepType } from '@/types/flow';

const stepTypeConfig: Record<StepType, { icon: React.ElementType; label: string; color: string }> = {
  message: { icon: MessageSquare, label: 'Mensaje', color: 'emerald' },
  question: { icon: HelpCircle, label: 'Pregunta', color: 'blue' },
  api_call: { icon: Webhook, label: 'API Call', color: 'purple' },
  condition: { icon: GitBranch, label: 'Condición', color: 'amber' },
  wait: { icon: Clock, label: 'Espera', color: 'slate' },
};

type FlowEditorProps = {
  flowId: string;
  onClose: () => void;
};

export function FlowEditor({ flowId, onClose }: FlowEditorProps) {
  const { toast } = useToast();
  const { data: flow, isLoading } = useFlow(flowId);
  const { data: steps = [] } = useFlowSteps(flowId);
  const updateFlow = useUpdateFlow(flowId);
  const createStep = useCreateStep(flowId);
  const deleteStep = useDeleteStep(flowId);
  const updateStep = useUpdateStep(flowId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState(false);

  // Initialize form when flow loads
  useState(() => {
    if (flow) {
      setName(flow.name);
      setDescription(flow.description || '');
    }
  });

  const handleSave = async () => {
    try {
      await updateFlow.mutateAsync({
        name: name || flow?.name,
        description: description || flow?.description || '',
        steps_count: steps.length,
      });
      toast({ title: 'Guardado', description: 'Los cambios se han guardado correctamente' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los cambios' });
    }
  };

  const handlePublish = async () => {
    try {
      await updateFlow.mutateAsync({
        status: 'active',
        steps_count: steps.length,
      });
      toast({ title: 'Publicado', description: 'El flujo está ahora activo' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar el flujo' });
    }
  };

  const handleAddStep = async (type: StepType) => {
    try {
      await createStep.mutateAsync({
        order_index: steps.length,
        type,
        name: `${stepTypeConfig[type].label} ${steps.length + 1}`,
        config: {},
      });
      setAddingStep(false);
      toast({ title: 'Paso agregado' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo agregar el paso' });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm('¿Eliminar este paso?')) return;
    try {
      await deleteStep.mutateAsync(stepId);
      toast({ title: 'Paso eliminado' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el paso' });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border/30">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Flujo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <X size={18} />
          </Button>
          <div>
            <h2 className="font-semibold text-foreground">Editar Flujo</h2>
            <p className="text-xs text-muted-foreground">
              {flow.status === 'active' ? 'Activo' : flow.status === 'draft' ? 'Borrador' : 'Archivado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={updateFlow.isPending}
            className="gap-2 rounded-lg"
          >
            {updateFlow.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </Button>
          {flow.status !== 'active' && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={updateFlow.isPending}
              className="gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <Play size={14} />
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Flow Details */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nombre del proceso
            </label>
            <Input
              value={name || flow.name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-11 rounded-xl bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
              placeholder="Ej: Apertura de cuenta"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              value={description || flow.description || ''}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full min-h-[80px] px-3 py-2 rounded-xl bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500/50 resize-none text-sm"
              placeholder="Describe el propósito de este flujo..."
            />
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Pasos del flujo</h3>
            <span className="text-xs text-muted-foreground">{steps.length} pasos</span>
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => {
              const config = stepTypeConfig[step.type as StepType] || stepTypeConfig.message;
              const IconComponent = config.icon;
              const isExpanded = expandedStepId === step.id;

              return (
                <div
                  key={step.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/30 bg-card/50 hover:border-border/60'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                  >
                    <div className="text-muted-foreground/50 cursor-grab">
                      <GripVertical size={16} />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/10 flex items-center justify-center`}>
                      <IconComponent size={16} className={`text-${config.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{step.name}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/50 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStep(step.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/20 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Nombre del paso</label>
                        <Input
                          value={step.name}
                          onChange={(e) =>
                            updateStep.mutate({ id: step.id, name: e.target.value })
                          }
                          className="mt-1 h-9 rounded-lg bg-background/50"
                        />
                      </div>
                      {step.type === 'message' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Contenido del mensaje</label>
                          <textarea
                            className="mt-1 w-full min-h-[80px] px-3 py-2 rounded-lg bg-background/50 border border-border/30 text-sm resize-none"
                            placeholder="Escribe el mensaje que se enviará..."
                            defaultValue={(step.config as { content?: string })?.content || ''}
                          />
                        </div>
                      )}
                      {step.type === 'question' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Pregunta</label>
                          <Input
                            className="mt-1 h-9 rounded-lg bg-background/50"
                            placeholder="¿Cuál es tu pregunta?"
                            defaultValue={(step.config as { question?: string })?.question || ''}
                          />
                        </div>
                      )}
                      {step.type === 'api_call' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Endpoint URL</label>
                          <Input
                            className="mt-1 h-9 rounded-lg bg-background/50 font-mono text-xs"
                            placeholder="https://api.ejemplo.com/endpoint"
                            defaultValue={(step.config as { url?: string })?.url || ''}
                          />
                        </div>
                      )}
                      {step.type === 'wait' && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Tiempo de espera (segundos)</label>
                          <Input
                            type="number"
                            className="mt-1 h-9 rounded-lg bg-background/50 w-32"
                            placeholder="60"
                            defaultValue={(step.config as { seconds?: number })?.seconds || 60}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Step */}
          {addingStep ? (
            <div className="mt-4 p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
              <p className="text-sm font-medium text-foreground mb-3">Selecciona el tipo de paso</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(stepTypeConfig) as StepType[]).map((type) => {
                  const config = stepTypeConfig[type];
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddStep(type)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-background/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/10 flex items-center justify-center`}>
                        <IconComponent size={16} className={`text-${config.color}-600`} />
                      </div>
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddingStep(false)}
                className="mt-3 w-full"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setAddingStep(true)}
              className="mt-4 w-full gap-2 rounded-xl h-12 border-dashed"
            >
              <Plus size={16} />
              Agregar paso
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Última actualización: {flow.updated_at ? new Date(flow.updated_at).toLocaleDateString() : 'N/A'}
          </p>
          <div className="flex items-center gap-2">
            {flow.status === 'active' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 size={12} />
                Publicado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

