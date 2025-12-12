import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiWsUrl, API_URL } from '@/lib/api';
import type { Account } from '@/types/account';
import { mapStatusDisplay, maskPhone, normalizeAccountForUi, shortId } from '@/lib/utils';
import { sampleProcessDetailById, sampleProcessEventsById, sampleProcessesAdmin, sampleConversations, sampleConversationDetailById } from '@/lib/samples';
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

const IS_DEV = import.meta.env.DEV;
const withSampleFallback = async <T>(label: string, runner: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await runner();
  } catch (error) {
    if (IS_DEV) console.warn(`[fallback:${label}]`, error);
    return fallback;
  }
};

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
    queryFn: () => {
      if (!API_URL) return Promise.resolve(sampleConversations);
      return withSampleFallback(
        'conversations',
        () => apiGet('/api/v1/conversations', conversationListSchema, sampleConversations),
        sampleConversations,
      );
    },
    staleTime: 1000 * 30,
  });

export const useConversationDetail = (id?: string) =>
  useQuery({
    queryKey: ['conversation', id],
    enabled: Boolean(id),
    queryFn: () => {
      const sampleDetail = sampleConversationDetailById(id);
      if (!API_URL) return Promise.resolve(sampleDetail);
      return withSampleFallback(
        'conversation-detail',
        () => apiGet(`/api/v1/conversations/${id}`, conversationDetailSchema, sampleDetail),
        sampleDetail,
      );
    },
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
        direction: 'outbound',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
  });
};

type Message = z.infer<typeof messageSchema>;
type Generic = Record<string, unknown>;
const invalidateProcessQueries = (qc: ReturnType<typeof useQueryClient>, id?: string) => {
  qc.invalidateQueries({ queryKey: ['admin-process', id] });
  qc.invalidateQueries({ queryKey: ['admin-process-events', id] });
  qc.invalidateQueries({ queryKey: ['admin-processes'] });
};

export const useConversationStream = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const url = apiWsUrl(`/api/v1/conversations/ws/${conversationId}`);
    if (!url) return;

    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle wrapped format { type: "message", payload: {...} }
        const payload = data?.type === 'message' ? data.payload : data;
        const parsed = messageSchema.safeParse(payload);
        if (parsed.success) {
          setMessages((prev) => [...prev, parsed.data]);
        }
      } catch {
        // Ignore malformed messages
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
type ProcessDetail = z.infer<typeof processDetailSchema>;
type ProcessDetailWithUi = ProcessDetail & {
  displayName: string;
  phoneMasked: string;
  statusDisplay: ReturnType<typeof mapStatusDisplay>;
  verificationDisplay: ReturnType<typeof mapStatusDisplay>;
  bankingDisplay: ReturnType<typeof mapStatusDisplay>;
  timestampFmt?: string | null;
};

const unwrapProcessDetail = (raw: unknown, fallback: ProcessDetail, id?: string): ProcessDetail => {
  const matchesId = (candidateId?: unknown) => !id || (candidateId !== undefined && String(candidateId) === String(id));

  const coerce = (source: unknown): ProcessDetail | null => {
    if (!source || typeof source !== 'object') return null;

    const payload = (source as { data?: unknown })?.data ?? source;
    const account = (payload as { account?: unknown })?.account || payload;
    const base: Record<string, unknown> = { ...(payload as Record<string, unknown>) };

    // Preserve nested account
    if ((payload as { account?: unknown })?.account) {
      base.account = (payload as { account?: unknown })?.account;
    }

    // Coerce essential identifiers from account when the top-level is missing them
    if (account && typeof account === 'object') {
      const acc = account as { [key: string]: unknown };
      base.id = base.id ?? acc.id ?? id ?? fallback.id;
      base.phone = base.phone ?? acc.phone_main ?? acc.whatsapp_phone_e164 ?? (payload as { phone?: unknown })?.phone;
      base.whatsapp_phone_e164 = base.whatsapp_phone_e164 ?? acc.whatsapp_phone_e164;
      base.name = base.name ?? acc.full_name ?? acc.document_number ?? (payload as { name?: unknown })?.name;
      base.status = base.status ?? (payload as { status?: unknown })?.status ?? acc.status;
      base.verification_status =
        base.verification_status ??
        (payload as { verification_status?: unknown })?.verification_status ??
        acc.phone_verification_status ??
        acc.qic_status ??
        acc.didit_status;
      base.banking_status = base.banking_status ?? (payload as { banking_status?: unknown })?.banking_status ?? acc.bank_status;
    }

    // Map common containers
    base.beneficiaries = base.beneficiaries ?? (payload as { beneficiaries?: unknown })?.beneficiaries;
    base.timeline = base.timeline ?? (payload as { timeline?: unknown })?.timeline ?? (payload as { events?: unknown })?.events;
    base.banking_events =
      base.banking_events ?? (payload as { banking_events?: unknown })?.banking_events ?? (payload as { events?: unknown })?.events;

    const parsed = processDetailSchema.safeParse(base);
    return parsed.success ? parsed.data : null;
  };

  const candidates = [
    raw,
    (raw as { data?: unknown })?.data,
    (raw as { data?: { data?: unknown } })?.data?.data,
  ];

  for (const candidate of candidates) {
    const parsed = coerce(candidate);
    if (parsed && matchesId(parsed.id)) return parsed;
  }

  // Fallback to first successful parse ignoring id match
  for (const candidate of candidates) {
    const parsed = coerce(candidate);
    if (parsed) return parsed;
  }

  return fallback;
};

export const useProcessesAdmin = (filters: Partial<{ q: string; status: string; phone: string; limit: number; offset: number }>) => {
  const queryString = useMemo(() => {
    const parts = Object.entries(filters || {})
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }, [filters]);

  return useQuery({
    queryKey: ['admin-processes', queryString],
    queryFn: async () => {
      if (!API_URL) return sampleProcessesAdmin;
      try {
        return await apiGet(`/admin/processes${queryString}`, processesAdminSchema, sampleProcessesAdmin);
      } catch {
        // Fallback to sample data when API fails
        return sampleProcessesAdmin;
      }
    },
    staleTime: 1000 * 30,
    refetchInterval: 30000,
    retry: false,
  });
};

export const useProcessDetail = (id?: string) =>
  useQuery<ProcessDetailWithUi>({
    queryKey: ['admin-process', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const sampleDetail = sampleProcessDetailById(id) as ProcessDetail;
      const fallbackDetail = sampleDetail || defaultProcess(id);
      const raw = API_URL
        ? await withSampleFallback(
            'process-detail',
            () => apiGet<unknown>(`/admin/processes/${id}`, z.any(), fallbackDetail as ProcessDetail),
            fallbackDetail as unknown,
          )
        : fallbackDetail;
      const base = unwrapProcessDetail(raw, fallbackDetail, id);

      const mergedAccount = {
        ...(base as Account),
        ...(((base as { account?: Account })?.account || base.account) as Account),
      };
      const account = mergedAccount;
      if (IS_DEV && (!account || !Object.keys(account).length)) {
        console.warn('[process-detail] account missing after unwrap; check payload shape', { raw });
      }
      const normalized = normalizeAccountForUi(account, { id: base.id, phone: base.phone ?? undefined, name: base.name ?? undefined });
      const phoneMasked = maskPhone(normalized.mainPhone || (base.phone ?? undefined));
      const displayName = normalized.displayName || base.name || phoneMasked || shortId(base.id);
      const statusDisplay = mapStatusDisplay(base.status ?? base.banking_status ?? undefined);
      const verificationDisplay = mapStatusDisplay(base.verification_status ?? undefined);
      const bankingDisplay = mapStatusDisplay(base.banking_status ?? undefined);
      const timestampFmt = base.updated_at ?? base.last_error_at ?? base.created_at ?? undefined;

      return {
        ...base,
        account,
        displayName,
        phoneMasked,
        statusDisplay,
        verificationDisplay,
        bankingDisplay,
        timestampFmt,
      };
    },
    staleTime: 1000 * 20,
    retry: false,
  });

export const useProcessEvents = (id?: string) =>
  useQuery({
    queryKey: ['admin-process-events', id],
    enabled: Boolean(id),
    queryFn: () => {
      const sampleEvents = sampleProcessEventsById(id);
      if (!API_URL) return Promise.resolve(sampleEvents);
      return withSampleFallback(
        'process-events',
        () => apiGet(`/admin/processes/${id}/events`, processEventsSchema, sampleEvents),
        sampleEvents,
      );
    },
    staleTime: 1000 * 20,
    refetchInterval: 20000,
    retry: false,
  });

type AuditPayload = { reason?: string; operator?: string; increment_attempts?: boolean };

export const useProcessStatus = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload & { status: string }) =>
      apiPost(`/admin/processes/${id}/status`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      invalidateProcessQueries(queryClient, id);
    },
  });
};

export const useProcessRetry = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload = {}) => apiPost(`/admin/processes/${id}/retry`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      invalidateProcessQueries(queryClient, id);
    },
  });
};

export const useProcessRerun = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload & { include_events?: boolean } = { include_events: true }) =>
      apiPost(`/admin/processes/${id}/rerun`, processDetailSchema, body, defaultProcess(id)),
    onSuccess: () => {
      invalidateProcessQueries(queryClient, id);
    },
  });
};

export const useVerificationApproveManual = (accountOpeningId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload = {}) =>
      apiPost(`/admin/verifications/${accountOpeningId}/approve-manual`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useVerificationRejectManual = (accountOpeningId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload = {}) =>
      apiPost(`/admin/verifications/${accountOpeningId}/reject-manual`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useOtpResend = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic) => apiPost('/admin/verifications/otp/resend', z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useOtpMarkVerified = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic) => apiPost('/admin/verifications/otp/mark-verified', z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useDiditRegenerate = (verificationId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic = {}) =>
      apiPost(`/admin/verifications/${verificationId}/didit/regenerate`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useDiditOverride = (verificationId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic) =>
      apiPost(`/admin/verifications/${verificationId}/didit/override`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const usePhoneCampaignTrigger = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic) => apiPost('/admin/verifications/phone-campaign/trigger', z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBankingStatus = (bankingId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload & { status: string }) =>
      apiPost(`/admin/banking/${bankingId}/status`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBankingRetry = (bankingId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AuditPayload = {}) => apiPost(`/admin/banking/${bankingId}/retry`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBankingPayloadSave = (bankingId?: string, processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Generic) => apiPost(`/admin/banking/${bankingId}/payload/save`, z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

// Bridge API
export const useBridgeBlacklistQuery = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost('/bridge/listas/black-list-query', z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeMicoopeClient = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => apiGet(`/bridge/fena/micoope-client/${clientId}`, z.any(), {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeCreateMicoopeIndividual = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost('/bridge/fena/create-micoope-individual-client', z.any(), body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeComplementaryDataCreate = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { clientId: string; body: Record<string, unknown> }) =>
      apiPost(`/bridge/fena/micoope-individual-client-complementary-data/${params.clientId}`, z.any(), params.body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeCreateStandardAccount = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { clientId: string; body: Record<string, unknown> }) =>
      apiPost(`/bridge/fena/create-standard-account/${params.clientId}`, z.any(), params.body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeUpdateOnboarding = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { clientId: string; body: Record<string, unknown> }) =>
      apiPut(`/bridge/fena/update-client-onboarding/${params.clientId}`, z.any(), params.body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeUpdateComplementaryData = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { clientId: string; body: Record<string, unknown> }) =>
      apiPut(`/bridge/fena/update-client-complementary-data/${params.clientId}`, z.any(), params.body, {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

export const useBridgeQueryComplementClient = (processId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => apiGet(`/bridge/fena/query-complement-client?clientId=${encodeURIComponent(clientId)}`, z.any(), {}),
    onSuccess: () => invalidateProcessQueries(queryClient, processId),
  });
};

type OtpHealth = z.infer<typeof otpHealthSchema>;
type CarlaHealth = z.infer<typeof carlaHealthSchema>;
type CarlaHealthData = z.infer<typeof carlaHealthDataSchema>;

const HEALTH_OTP_URL = (import.meta.env.VITE_HEALTH_OTP_URL as string | undefined)?.trim() || 'https://carla-otp.vercel.app/health';
const HEALTH_CORE_URL =
  (import.meta.env.VITE_HEALTH_CORE_URL as string | undefined)?.trim() ||
  (API_URL ? `${API_URL}/health` : 'https://x.carla.money/health');

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
      fetchJson<OtpHealth | null>(HEALTH_OTP_URL, otpHealthSchema, null),
      fetchJson<CarlaHealth | null>(HEALTH_CORE_URL, carlaHealthSchema, null),
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

