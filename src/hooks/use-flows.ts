import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { whatsappFlowSchema, whatsappFlowsSchema, flowStepsSchema, flowStepSchema } from '@/lib/schemas';
import type { CreateFlowInput, UpdateFlowInput, CreateStepInput, UpdateStepInput } from '@/types/flow';

// Supabase client setup
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
};

const supabaseRest = async <T>(
  table: string,
  schema: z.ZodType<T>,
  options: {
    method?: string;
    query?: string;
    body?: unknown;
    single?: boolean;
  } = {}
): Promise<T> => {
  const { method = 'GET', query = '', body, single = false } = options;
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
  
  const res = await fetch(url, {
    method,
    headers: {
      ...supabaseHeaders,
      ...(single ? { 'Accept': 'application/vnd.pgrst.object+json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Supabase error: ${error}`);
  }
  
  const json = await res.json();
  const parsed = schema.safeParse(json);
  
  if (!parsed.success) {
    console.warn('[use-flows] Schema parse error:', parsed.error);
    return json as T;
  }
  
  return parsed.data;
};

type WhatsAppFlow = z.infer<typeof whatsappFlowSchema>;
type FlowStep = z.infer<typeof flowStepSchema>;

// Sample data for when Supabase is not configured
const sampleFlows: WhatsAppFlow[] = [
  {
    id: 'flow-1',
    name: 'Apertura de Cuenta de Ahorros',
    description: 'Proceso completo de apertura de cuenta con KYC y validaciones',
    status: 'active',
    icon: 'wallet',
    steps_count: 12,
    usage_count: 234,
    cooperative_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_by: null,
    config: {},
  },
  {
    id: 'flow-2',
    name: 'Solicitud de Crédito Personal',
    description: 'Evaluación crediticia y aprobación de créditos personales',
    status: 'active',
    icon: 'credit-card',
    steps_count: 18,
    usage_count: 156,
    cooperative_id: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_by: null,
    config: {},
  },
  {
    id: 'flow-3',
    name: 'Transferencias Internacionales',
    description: 'Gestión de transferencias SWIFT y validaciones de cumplimiento',
    status: 'draft',
    icon: 'globe',
    steps_count: 10,
    usage_count: 0,
    cooperative_id: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: null,
    config: {},
  },
];

// Normalize text for search (remove accents)
const normalizeText = (text: string) => 
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Flows hooks
export const useFlows = (filters?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['whatsapp-flows', filters],
    queryFn: async () => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        // Return sample data when Supabase is not configured
        let flows = [...sampleFlows];
        if (filters?.status) {
          flows = flows.filter(f => f.status === filters.status);
        }
        if (filters?.search) {
          const search = normalizeText(filters.search);
          flows = flows.filter(f => 
            normalizeText(f.name).includes(search) || 
            normalizeText(f.description || '').includes(search)
          );
        }
        return flows;
      }
      
      const queryParts: string[] = ['order=updated_at.desc'];
      if (filters?.status) {
        queryParts.push(`status=eq.${filters.status}`);
      }
      if (filters?.search) {
        queryParts.push(`or=(name.ilike.*${filters.search}*,description.ilike.*${filters.search}*)`);
      }
      
      return supabaseRest('whatsapp_flows', whatsappFlowsSchema, {
        query: queryParts.join('&'),
      });
    },
    staleTime: 30000,
  });
};

export const useFlow = (id?: string) => {
  return useQuery({
    queryKey: ['whatsapp-flow', id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const flow = sampleFlows.find(f => f.id === id);
        return flow || null;
      }
      
      const flow = await supabaseRest('whatsapp_flows', whatsappFlowSchema, {
        query: `id=eq.${id}`,
        single: true,
      });
      
      // Also fetch steps
      const steps = await supabaseRest('flow_steps', flowStepsSchema, {
        query: `flow_id=eq.${id}&order=order_index.asc`,
      });
      
      return { ...flow, steps };
    },
    staleTime: 20000,
  });
};

export const useCreateFlow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateFlowInput) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const newFlow: WhatsAppFlow = {
          id: `flow-${Date.now()}`,
          name: input.name,
          description: input.description || null,
          status: input.status || 'draft',
          icon: input.icon || 'workflow',
          steps_count: 0,
          usage_count: 0,
          cooperative_id: input.cooperative_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          config: input.config || {},
        };
        sampleFlows.unshift(newFlow);
        return newFlow;
      }
      
      return supabaseRest('whatsapp_flows', whatsappFlowSchema, {
        method: 'POST',
        body: input,
        single: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] });
    },
  });
};

export const useUpdateFlow = (id?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateFlowInput) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const idx = sampleFlows.findIndex(f => f.id === id);
        if (idx >= 0) {
          sampleFlows[idx] = { ...sampleFlows[idx], ...input, updated_at: new Date().toISOString() };
          return sampleFlows[idx];
        }
        throw new Error('Flow not found');
      }
      
      return supabaseRest('whatsapp_flows', whatsappFlowSchema, {
        method: 'PATCH',
        query: `id=eq.${id}`,
        body: { ...input, updated_at: new Date().toISOString() },
        single: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flow', id] });
    },
  });
};

export const useDeleteFlow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const idx = sampleFlows.findIndex(f => f.id === id);
        if (idx >= 0) {
          sampleFlows.splice(idx, 1);
        }
        return { success: true };
      }
      
      await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_flows?id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] });
    },
  });
};

// Flow Steps hooks
export const useFlowSteps = (flowId?: string) => {
  return useQuery({
    queryKey: ['flow-steps', flowId],
    enabled: Boolean(flowId),
    queryFn: async () => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return [];
      }
      
      return supabaseRest('flow_steps', flowStepsSchema, {
        query: `flow_id=eq.${flowId}&order=order_index.asc`,
      });
    },
    staleTime: 20000,
  });
};

export const useCreateStep = (flowId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Omit<CreateStepInput, 'flow_id'>) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return { id: `step-${Date.now()}`, flow_id: flowId, ...input } as FlowStep;
      }
      
      const result = await supabaseRest('flow_steps', flowStepSchema, {
        method: 'POST',
        body: { ...input, flow_id: flowId },
        single: true,
      });
      
      // Update steps_count on the flow
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_steps_count`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ flow_id: flowId }),
      }).catch(() => {});
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-steps', flowId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flow', flowId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] });
    },
  });
};

export const useUpdateStep = (flowId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateStepInput & { id: string }) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return { id, flow_id: flowId, ...input } as FlowStep;
      }
      
      return supabaseRest('flow_steps', flowStepSchema, {
        method: 'PATCH',
        query: `id=eq.${id}`,
        body: { ...input, updated_at: new Date().toISOString() },
        single: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-steps', flowId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flow', flowId] });
    },
  });
};

export const useDeleteStep = (flowId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return { success: true };
      }
      
      await fetch(`${SUPABASE_URL}/rest/v1/flow_steps?id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-steps', flowId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flow', flowId] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-flows'] });
    },
  });
};

