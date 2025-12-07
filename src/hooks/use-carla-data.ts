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

