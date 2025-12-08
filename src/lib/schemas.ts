import { z } from 'zod';

export const kpiSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  delta: z.union([z.number(), z.string()]).optional(),
  trend: z.enum(['up', 'down', 'flat']).optional(),
  helper: z.string().optional(),
});

export const kpisSchema = z.array(kpiSchema);

export const weeklyPointSchema = z.object({
  label: z.string(),
  total: z.number().optional(),
  breakdown: z.record(z.string(), z.number()).default({}),
});

export const weeklyActivitySchema = z.array(weeklyPointSchema);

export const processDistributionSchema = z.array(
  z.object({
    name: z.string(),
    value: z.number(),
  }),
);

export const conversationSchema = z.object({
  id: z.string(),
  name: z.string(),
  product: z.string().optional(),
  status: z.string().optional(),
  unread: z.number().optional(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const conversationListSchema = z.array(conversationSchema);

export const messageSchema = z.object({
  id: z.string().optional(),
  from: z.string(),
  body: z.string(),
  at: z.string(),
  direction: z.enum(['in', 'out']).optional(),
});

export const conversationDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  product: z.string().optional(),
  status: z.string().optional(),
  phone: z.string().optional(),
  unread: z.number().optional(),
  tags: z.array(z.string()).default([]),
  proceso: z.string().optional(),
  progreso: z.string().optional(),
  assignedTo: z.string().optional(),
  messages: z.array(messageSchema).default([]),
  profile: z
    .object({
      email: z.string().optional(),
      location: z.string().optional(),
      lastSeen: z.string().optional(),
    })
    .optional(),
});

export const transactionSchema = z.object({
  id: z.string(),
  cliente: z.string(),
  proceso: z.string(),
  etapa: z.string().optional(),
  progreso: z.number().optional(),
  tiempo: z.string().optional(),
  prioridad: z.string().optional(),
  tag: z.string().optional(),
  slaBreached: z.boolean().optional(),
});

export const transactionsSchema = z.array(transactionSchema);

export const procesoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  estado: z.string(),
  pasos: z.number().optional(),
  uso: z.string().optional(),
  updated: z.string().optional(),
});

export const procesosSchema = z.array(procesoSchema);

// Admin Processes (360)
const idAsString = z.union([z.string(), z.number()]).transform((v) => String(v));

export const processEventSchema = z
  .object({
    id: idAsString.optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    step: z.string().optional(),
    message: z.string().optional(),
    correlation_id: z.string().optional(),
    created_at: z.string().optional(),
    payload: z.unknown().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const processEventsSchema = z.array(processEventSchema);

export const processAdminSchema = z
  .object({
    id: idAsString,
    account_opening_id: idAsString.optional(),
    phone: z.string().optional(),
    name: z.string().optional(),
    status: z.string().optional(),
    banking_status: z.string().optional(),
    verification_status: z.string().optional(),
    verification_summary: z.record(z.string(), z.unknown()).optional(),
    ready_for_bank: z.boolean().optional(),
    attempts: z.number().optional(),
    events_count: z.number().optional(),
    last_error: z.string().nullable().optional(),
    last_error_at: z.string().optional(),
    steps: z.number().optional(),
    usage: z.number().optional(),
    tags: z.array(z.string()).optional(),
    updated_at: z.string().optional(),
    created_at: z.string().optional(),
    product_type: z.string().optional(),
    account_currency: z.string().optional(),
    correlation_id: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const processesAdminSchema = z.array(processAdminSchema);
export const processDetailSchema = processAdminSchema.extend({
  account: z.record(z.string(), z.unknown()).optional(),
  beneficiaries: z.array(z.record(z.string(), z.unknown())).optional(),
  events: processEventsSchema.optional(),
  timeline: z.array(processEventSchema).optional(),
  banking_events: processEventsSchema.optional(),
});

const connectionPoolSchema = z
  .object({
    active: z.number().optional(),
    idle: z.number().optional(),
    max: z.number().optional(),
  })
  .passthrough()
  .nullable()
  .optional();

const carlaServiceSchema = z.object({
  status: z.string(),
  type: z.string().nullable().optional(),
  latency_ms: z.number().nullable().optional(),
  connection_pool: connectionPoolSchema,
  rate_limit_remaining: z.number().nullable().optional(),
});

export const carlaHealthDataSchema = z.object({
  status: z.string(),
  service: z.string().optional(),
  version: z.string().optional(),
  environment: z.string().optional(),
  uptime_seconds: z.number().optional(),
  services: z.record(z.string(), carlaServiceSchema).default({}),
  system: z
    .object({
      python_version: z.string().optional(),
      platform: z.string().optional(),
      process_id: z.number().optional(),
    })
    .optional(),
  metrics: z
    .object({
      requests_total: z.number().optional(),
      requests_per_minute: z.number().optional(),
      average_response_time_ms: z.number().optional(),
    })
    .optional(),
});

export const carlaHealthEnvelopeSchema = z.object({
  data: carlaHealthDataSchema,
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const carlaHealthSchema = z.union([carlaHealthDataSchema, carlaHealthEnvelopeSchema]);

export const otpHealthEnvelopeSchema = z.object({
  data: carlaHealthDataSchema,
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const otpHealthSchema = z.union([
  carlaHealthDataSchema.extend({
    timestamp: z.string().optional(),
  }),
  otpHealthEnvelopeSchema,
]);

