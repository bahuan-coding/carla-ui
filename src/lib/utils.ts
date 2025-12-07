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

export const formatCurrency = (value?: number | null, currency?: string) => {
  if (value === null || value === undefined) return '—'
  try {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  } catch (e) {
    return `${currency || ''} ${value.toLocaleString()}`
  }
}

export const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
}

type RenapName = {
  primer_nombre?: string
  segundo_nombre?: string | null
  tercer_nombre?: string | null
  primer_apellido?: string
  segundo_apellido?: string
  apellido_casada?: string | null
}

export const buildFullNameFromRenap = (entry?: RenapName) => {
  if (!entry) return ''
  return [
    entry.primer_nombre,
    entry.segundo_nombre,
    entry.tercer_nombre,
    entry.primer_apellido,
    entry.segundo_apellido,
    entry.apellido_casada,
  ]
    .filter(Boolean)
    .join(' ')
}
