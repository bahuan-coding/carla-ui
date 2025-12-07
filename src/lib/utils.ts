import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mapeo legible de estados técnicos a etiquetas/tonos/íconos
export type StatusTone = 'ok' | 'warn' | 'error' | 'info'
export type StatusDisplay = { label: string; tone: StatusTone; icon: string }

const STATUS_DICT: Record<string, StatusDisplay> = {
  bank_rejected: { label: 'Rechazado banco', tone: 'error', icon: 'TriangleAlert' },
  bank_processing: { label: 'Procesando banco', tone: 'warn', icon: 'Loader' },
  bank_retry: { label: 'Reintento banco', tone: 'warn', icon: 'Repeat2' },
  ready_for_bank: { label: 'Listo para banco', tone: 'info', icon: 'Send' },
  account_created: { label: 'Cuenta creada', tone: 'ok', icon: 'CheckCircle' },
  collecting_data: { label: 'Recolectando datos', tone: 'info', icon: 'Inbox' },
  form_completed: { label: 'Formulario completo', tone: 'ok', icon: 'FileCheck' },
  phone_verified: { label: 'Teléfono verificado', tone: 'ok', icon: 'Phone' },
  started: { label: 'Iniciado', tone: 'info', icon: 'Play' },
  demo_completed: { label: 'Demo completada', tone: 'ok', icon: 'Sparkles' },
  default: { label: 'En curso', tone: 'info', icon: 'Dot' },
}

export const mapStatusDisplay = (status?: string): StatusDisplay => {
  if (!status) return STATUS_DICT.default
  const key = status.toLowerCase()
  return STATUS_DICT[key] || { ...STATUS_DICT.default, label: status }
}

export const toneBadge = (tone: StatusTone) =>
  tone === 'error'
    ? 'bg-destructive/15 text-destructive'
    : tone === 'warn'
      ? 'bg-amber-500/15 text-amber-200'
      : tone === 'ok'
        ? 'bg-emerald-500/15 text-emerald-200'
        : 'bg-foreground/10 text-foreground/70'

export const toneDot = (tone: StatusTone) =>
  tone === 'error' ? 'bg-destructive' : tone === 'warn' ? 'bg-amber-300' : tone === 'ok' ? 'bg-emerald-300' : 'bg-foreground/40'

export const maskPhone = (phone?: string) => {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return phone
  const last4 = digits.slice(-4)
  return `•••• ${last4}`
}

export const shortId = (id?: string) => {
  if (!id) return '—'
  if (id.length <= 8) return id
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}
