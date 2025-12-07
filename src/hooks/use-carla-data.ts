import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiWsUrl } from '@/lib/api';
import {
  conversationDetailSchema,
  conversationListSchema,
  kpisSchema,
  messageSchema,
  procesoSchema,
  processDistributionSchema,
  procesosSchema,
  transactionSchema,
  transactionsSchema,
  weeklyActivitySchema,
  carlaHealthSchema,
  carlaHealthDataSchema,
  otpHealthSchema,
  processesAdminSchema,
  processDetailSchema,
  processEventsSchema,
} from '@/lib/schemas';

export const useKpis = (period?: string) =>
  useQuery({
    queryKey: ['kpis', period],
    queryFn: () =>
      apiGet(`/api/v1/dashboard/kpis${period ? `?period=${period}` : ''}`, kpisSchema, []),
    staleTime: 1000 * 60 * 5,
  });

export const useWeeklyActivity = (period: string) =>
  useQuery({
    queryKey: ['weekly-activity', period],
    queryFn: () => apiGet(`/api/v1/dashboard/weekly-activity?period=${period}`, weeklyActivitySchema, []),
    staleTime: 1000 * 60 * 5,
  });

export const useProcessDistribution = (period: string) =>
  useQuery({
    queryKey: ['process-distribution', period],
    queryFn: () => apiGet(`/api/v1/dashboard/process-distribution?period=${period}`, processDistributionSchema, []),
    staleTime: 1000 * 60 * 5,
  });

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiGet('/api/v1/conversations', conversationListSchema, []),
    staleTime: 1000 * 30,
  });

export const useConversationDetail = (id?: string) =>
  useQuery({
    queryKey: ['conversation', id],
    enabled: Boolean(id),
    queryFn: () => apiGet(`/api/v1/conversations/${id}`, conversationDetailSchema, conversationDetailSchema.parse({ id, name: '...' })),
    staleTime: 1000 * 20,
  });

export const useSendMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { text: string }) =>
      apiPost(`/api/v1/conversations/${conversationId}/messages`, messageSchema, body, {
        id: crypto.randomUUID(),
        from: 'agent',
        body: body.text,
        at: new Date().toISOString(),
        direction: 'out',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
};

type Message = z.infer<typeof messageSchema>;

export const useConversationStream = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const url = apiWsUrl(`/api/v1/conversations/ws/${conversationId}`);
    if (!url) return;

    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      const parsed = messageSchema.safeParse(JSON.parse(event.data));
      if (parsed.success) {
        setMessages((prev) => [...prev, parsed.data]);
      }
    };
    ws.onerror = () => {
      // swallow; fallback to polling via TanStack Query
    };
    return () => ws.close();
  }, [conversationId]);

  return { liveMessages: messages };
};

export const useTransactions = (filters: Record<string, string | undefined>) => {
  const queryString = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
        .join('&'),
    [filters],
  );

  return useQuery({
    queryKey: ['transactions', queryString],
    queryFn: () => apiGet(`/api/v1/transactions${queryString ? `?${queryString}` : ''}`, transactionsSchema, []),
    staleTime: 1000 * 30,
  });
};

export const useProcesses = (search?: string) =>
  useQuery({
    queryKey: ['processes', search],
    queryFn: () => apiGet(`/api/v1/processes${search ? `?q=${encodeURIComponent(search)}` : ''}`, procesosSchema, []),
    staleTime: 1000 * 60,
  });

export const useTransaction = (id?: string) =>
  useQuery({
    queryKey: ['transaction', id],
    enabled: Boolean(id),
    queryFn: () => apiGet(`/api/v1/transactions/${id}`, transactionSchema, transactionSchema.parse({ id, cliente: '', proceso: '' })),
    staleTime: 1000 * 30,
  });

export const useCreateProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost('/api/v1/processes', procesoSchema, body, body as never),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['processes'] }),
  });
};

// Admin Processes
const defaultProcess = (id?: string) => processDetailSchema.parse({ id: id || crypto.randomUUID() });

export const useProcessesAdmin = (filters: Partial<{ q: string; status: string; phone: string; limit: number; offset: number }>) => {
  const queryString = useMemo(() => {
    const parts = Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }, [filters]);

  return useQuery({
    queryKey: ['admin-processes', queryString],
    queryFn: () => apiGet(`/admin/processes${queryString}`, processesAdminSchema, []),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
};

export const useProcessDetail = (id?: string) =>
  useQuery({
    queryKey: ['admin-process', id],
    enabled: Boolean(id),
    queryFn: () => apiGet(`/admin/processes/${id}`, processDetailSchema, defaultProcess(id)),
    staleTime: 1000 * 20,
  });

export const useProcessEvents = (id?: string) =>
  useQuery({
    queryKey: ['admin-process-events', id],
    enabled: Boolean(id),
    queryFn: () => apiGet(`/admin/processes/${id}/events`, processEventsSchema, []),
    staleTime: 1000 * 20,
    refetchInterval: 20000,
  });

type AuditPayload = { reason?: string; operator?: string; increment_attempts?: boolean };

export const useProcessStatus = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload & { status: string }) =>
      apiPost(`/admin/processes/${id}/status`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-process', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-processes'] });
    },
  });
};

export const useProcessRetry = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload = {}) => apiPost(`/admin/processes/${id}/retry`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-process', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-processes'] });
    },
  });
};

export const useProcessRerun = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload & { include_events?: boolean } = { include_events: true }) =>
      apiPost(`/admin/processes/${id}/rerun`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-process', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-process-events', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-processes'] });
    },
  });
};

type OtpHealth = z.infer<typeof otpHealthSchema>;
type CarlaHealth = z.infer<typeof carlaHealthSchema>;
type CarlaHealthData = z.infer<typeof carlaHealthDataSchema>;

const fetchJson = async <T>(url: string, schema: z.ZodType<T>, fallback: T): Promise<T> => {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return fallback;
    const json = await res.json().catch(() => null);
    if (!json) return fallback;
    const parsed = schema.safeParse(json);
    if (parsed.success) return parsed.data;
    return fallback;
  } catch {
    return fallback;
  }
};

export const useHealthServices = () =>
  useQuery({
    queryKey: ['health-services'],
    queryFn: async () => {
      const [otp, carla] = await Promise.all([
        fetchJson<OtpHealth | null>('https://carla-otp.vercel.app/health', otpHealthSchema, null),
        fetchJson<CarlaHealth | null>('https://x.carla.money/health', carlaHealthSchema, null),
      ]);

      const normalizeOtp = (raw: OtpHealth | null): (CarlaHealthData & { timestamp?: string }) | null => {
        if (!raw) return null;
        const data = 'data' in raw ? raw.data : raw;
        const timestamp = 'meta' in raw ? raw.meta?.timestamp : (data as { timestamp?: string }).timestamp;
        const service = (raw as { service?: string }).service || (data as { service?: string }).service;
        return { ...data, service, timestamp };
      };

      const normalizeCarla = (raw: CarlaHealth | null): (CarlaHealthData & { timestamp?: string }) | null => {
        if (!raw) return null;
        const data = 'data' in raw ? raw.data : raw;
        const timestamp = 'meta' in raw ? raw.meta?.timestamp : undefined;
        return { ...data, timestamp };
      };

      const normalizedOtp = normalizeOtp(otp);
      const normalizedCarla = normalizeCarla(carla);

      return { otp: normalizedOtp, carla: normalizedCarla };
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });

