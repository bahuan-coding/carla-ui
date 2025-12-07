import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Account, CompleteFlowData, RenapCitizenEntry } from "@/types/account"

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

const getRenapEntry = (account?: Account): RenapCitizenEntry | undefined => {
  if (!account) return undefined
  const raw = account.renap_citizen_data
  if (!raw) return undefined
  const container = Array.isArray(raw) ? raw[0] : raw
  return (container?.citizen_data || [])[0] as RenapCitizenEntry | undefined
}

const asNumber = (value?: string | number | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(num) ? undefined : num
}

const asStringOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return null
}

export const normalizeAccountForUi = (
  account?: Account,
  processFallback?: { id?: string; phone?: string; name?: string },
): {
  renapEntry?: RenapCitizenEntry
  fullName: string
  displayName: string
  email?: string
  mainPhone?: string
  documentLabel: string
  address?: string
  housingType?: string | null
  nationality?: string | null
  maritalStatus?: string | null
  gender?: string | null
  employmentStatus?: string | null
  employer?: string | null
  monthlyIncome?: number | null
  monthlyExpenses?: number | null
  otherIncomeSources?: string | null
  complianceSource: string[]
  riskFlags: { pep?: boolean; pepRelated?: boolean; usTax?: boolean; risk: boolean }
} => {
  const acc = account || {}
  const extra = acc.extra_data || {}
  const flow = (extra.complete_flow_data || {}) as CompleteFlowData
  const renapEntry = getRenapEntry(acc)
  const fullNameFromRenap = buildFullNameFromRenap(renapEntry)
  const fullName = (fullNameFromRenap || acc.full_name || acc.document_number || flow.numeroIdentificacion || '').trim()
  const displayName =
    fullName ||
    acc.full_name ||
    acc.document_number ||
    flow.numeroIdentificacion ||
    processFallback?.name ||
    maskPhone(processFallback?.phone) ||
    shortId(processFallback?.id)

  const email = acc.email || extra.contact_screen?.correo_electronico || flow.correo_electronico || ''
  const mainPhone =
    acc.phone_main || acc.whatsapp_phone_e164 || extra.whatsapp_phone_e164 || processFallback?.phone || acc.phone_secondary || ''

  const documentLabel = `${acc.document_type || '—'} · ${acc.document_number || '—'} · ${acc.document_country || '—'}`

  const address = acc.address_full || extra.address_screen?.direccion_completa || flow.direccion_completa || ''
  const housingType = acc.address_housing_type || extra.address_screen?.tipo_vivienda || flow.tipo_vivienda || null
  const nationality = acc.nationality || renapEntry?.nacionalidad || flow.nacionalidad || null
  const maritalStatus = acc.marital_status || renapEntry?.estado_civil || flow.estado_civil || null
  const gender = acc.gender || renapEntry?.genero || null

  const employmentStatus = acc.employment_status || extra.employment_screen?.relacion_laboral || flow.relacion_laboral || null
  const employer = acc.employer_name || extra.employment_screen?.nombre_empresa || flow.nombre_empresa || null
  const monthlyIncome = acc.monthly_income ?? asNumber(extra.employment_screen?.ingresos_mensuales) ?? asNumber(flow.ingresos_mensuales) ?? null
  const monthlyExpenses = acc.monthly_expenses ?? asNumber(extra.employment_screen?.egresos_mensuales) ?? asNumber(flow.egresos_mensuales) ?? null
  const otherIncomeSources =
    asStringOrNull(acc.other_income_sources) ??
    asStringOrNull(extra.employment_screen?.otra_fuente_ingresos) ??
    asStringOrNull(flow.otra_fuente_ingresos) ??
    null

  const complianceSource =
    (acc.compliance_checks_raw && acc.compliance_checks_raw.length ? acc.compliance_checks_raw : []) ||
    (extra.compliance_screen?.compliance_checks ? [extra.compliance_screen.compliance_checks] : []) ||
    (flow.compliance_checks ? [flow.compliance_checks] : [])

  const riskFlags = {
    pep: acc.is_pep,
    pepRelated: acc.is_pep_related,
    usTax: acc.has_us_tax_obligations,
    risk:
      Boolean(acc.is_pep) ||
      Boolean(acc.is_pep_related) ||
      Boolean(acc.has_us_tax_obligations) ||
      complianceSource.some((c) => c && c !== 'noneApply'),
  }

  return {
    renapEntry,
    fullName,
    displayName,
    email,
    mainPhone,
    documentLabel,
    address,
    housingType,
    nationality,
    maritalStatus,
    gender,
    employmentStatus,
    employer,
    monthlyIncome,
    monthlyExpenses,
    otherIncomeSources,
    complianceSource,
    riskFlags,
  }
}
