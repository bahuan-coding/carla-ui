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

