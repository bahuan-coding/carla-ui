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
  bank_blacklist_approved: { label: 'Completado', tone: 'ok', icon: 'CheckCircle' },
  bank_client_created: { label: 'Completado', tone: 'ok', icon: 'CheckCircle' },
  bank_complementary_completed: { label: 'Completado', tone: 'ok', icon: 'CheckCircle' },
  bank_account_created: { label: 'Completado', tone: 'ok', icon: 'CheckCircle' },
  bank_blacklist_in_progress: { label: 'Procesando', tone: 'warn', icon: 'Loader' },
  bank_client_in_progress: { label: 'Procesando', tone: 'warn', icon: 'Loader' },
  bank_complementary_in_progress: { label: 'Procesando', tone: 'warn', icon: 'Loader' },
  bank_account_in_progress: { label: 'Procesando', tone: 'warn', icon: 'Loader' },
  bank_blacklist_pending: { label: 'Pendiente', tone: 'info', icon: 'Clock' },
  bank_client_pending: { label: 'Pendiente', tone: 'info', icon: 'Clock' },
  bank_complementary_pending: { label: 'Pendiente', tone: 'info', icon: 'Clock' },
  bank_account_pending: { label: 'Pendiente', tone: 'info', icon: 'Clock' },
  bank_blacklist_error: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_client_error: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_complementary_error: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_account_error: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_blacklist_rejected: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_client_rejected: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_complementary_rejected: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  bank_account_rejected: { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' },
  // Additional bank flow statuses
  didit_verified: { label: 'DIDIT Verificado', tone: 'ok', icon: 'CheckCircle' },
  bank_onboarding_updated: { label: 'Onboarding Actualizado', tone: 'ok', icon: 'CheckCircle' },
  bank_onboarding_update_in_progress: { label: 'Actualizando Onboarding', tone: 'warn', icon: 'Loader' },
  bank_onboarding_update_error: { label: 'Error Onboarding', tone: 'error', icon: 'TriangleAlert' },
  bank_complementary_updated: { label: 'Complemento Actualizado', tone: 'ok', icon: 'CheckCircle' },
  bank_complementary_update_in_progress: { label: 'Actualizando Complemento', tone: 'warn', icon: 'Loader' },
  bank_complementary_update_error: { label: 'Error Complemento', tone: 'error', icon: 'TriangleAlert' },
  bank_complement_query_in_progress: { label: 'Consultando', tone: 'warn', icon: 'Loader' },
  bank_complement_query_error: { label: 'Error Consulta', tone: 'error', icon: 'TriangleAlert' },
  bank_client_creation_in_progress: { label: 'Creando Cliente', tone: 'warn', icon: 'Loader' },
  bank_client_creation_error: { label: 'Error Cliente', tone: 'error', icon: 'TriangleAlert' },
  bank_client_lookup_in_progress: { label: 'Buscando Cliente', tone: 'warn', icon: 'Loader' },
  bank_account_creation_in_progress: { label: 'Creando Cuenta', tone: 'warn', icon: 'Loader' },
  bank_account_creation_error: { label: 'Error Cuenta', tone: 'error', icon: 'TriangleAlert' },
  default: { label: 'En curso', tone: 'info', icon: 'Dot' },
}

export const mapStatusDisplay = (status?: string): StatusDisplay => {
  if (!status) return STATUS_DICT.default
  const key = status.toLowerCase()
  if (STATUS_DICT[key]) return STATUS_DICT[key]
  if (/_error|_rejected|fail/.test(key)) return { label: 'Rechazado/Erro', tone: 'error', icon: 'TriangleAlert' }
  if (/_in_progress|processing/.test(key)) return { label: 'Procesando', tone: 'warn', icon: 'Loader' }
  if (/pending|waiting/.test(key)) return { label: 'Pendiente', tone: 'info', icon: 'Clock' }
  if (/approved|created|completed|success|ok/.test(key)) return { label: 'Completado', tone: 'ok', icon: 'CheckCircle' }
  return { ...STATUS_DICT.default, label: status }
}

// Status to progress/stage mapping for transaction display
export type TransactionProgress = { progress: number; stage: string }

const STATUS_PROGRESS_MAP: Record<string, TransactionProgress> = {
  started: { progress: 5, stage: 'Iniciado' },
  collecting_data: { progress: 10, stage: 'Recolectando Datos' },
  form_completed: { progress: 20, stage: 'Formulario Completado' },
  phone_verified: { progress: 30, stage: 'Teléfono Verificado' },
  renap_approved: { progress: 40, stage: 'RENAP Aprobado' },
  ready_for_bank: { progress: 50, stage: 'Listo para Banco' },
  bank_client_creation_in_progress: { progress: 60, stage: 'Creando Cliente' },
  bank_processing: { progress: 60, stage: 'Creando Cliente' },
  bank_client_created: { progress: 65, stage: 'Cliente Creado' },
  bank_account_creation_in_progress: { progress: 70, stage: 'Creando Cuenta' },
  bank_account_created: { progress: 80, stage: 'Cuenta Creada' },
  account_created: { progress: 100, stage: 'Cuenta Activa' },
  bank_rejected: { progress: 100, stage: 'Rechazado' },
  demo_completed: { progress: 100, stage: 'Demo Completado' },
}

export const mapStatusToProgress = (status?: string | null): TransactionProgress => {
  if (!status) return { progress: 0, stage: 'Sin estado' }
  const key = status.toLowerCase()
  return STATUS_PROGRESS_MAP[key] || { progress: 0, stage: status }
}

export const toneBadge = (tone: StatusTone) =>
  tone === 'error'
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    : tone === 'warn'
      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
      : tone === 'ok'
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'

export const toneDot = (tone: StatusTone) =>
  tone === 'error' ? 'bg-destructive' : tone === 'warn' ? 'bg-amber-300' : tone === 'ok' ? 'bg-emerald-300' : 'bg-foreground/40'

export const maskPhone = (phone?: string) => {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return phone
  const last4 = digits.slice(-4)
  const prefix = phone.startsWith('+') ? phone.slice(0, 4).replace(/[^+0-9]/g, '') : ''
  return prefix ? `${prefix} *** ${last4}` : `*** ${last4}`
}

/** Normalize phone to E.164 format (+countrycode...). Default country code is Guatemala (+502). */
export const normalizeToE164 = (phone?: string | null, defaultCountryCode = '502'): string | null => {
  if (!phone) return null
  const cleaned = phone.replace(/[\s\-().]/g, '')
  if (cleaned.startsWith('+')) {
    return /^\+\d{10,15}$/.test(cleaned) ? cleaned : null
  }
  const digits = cleaned.replace(/\D/g, '')
  if (!digits || digits.length < 8) return null
  const withCode = digits.length <= 8 ? `+${defaultCountryCode}${digits}` : `+${digits}`
  return /^\+\d{10,15}$/.test(withCode) ? withCode : null
}

/** Validate if a phone is in valid E.164 format */
export const isValidE164 = (phone?: string | null): boolean => {
  if (!phone) return false
  return /^\+\d{10,15}$/.test(phone)
}

export const formatPhone = (phone?: string | null) => {
  if (!phone) return '—'
  const cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.length < 8) return phone

  const formatNational = (val: string) => {
    const len = val.length
    if (len === 8) return `${val.slice(0, 4)} ${val.slice(4)}`
    if (len === 9) return `${val.slice(0, 1)} ${val.slice(1, 5)} ${val.slice(5)}`
    if (len === 10) return `${val.slice(0, 2)} ${val.slice(2, 6)} ${val.slice(6)}`
    if (len === 11) return `${val.slice(0, 2)} ${val.slice(2, 7)} ${val.slice(7)}`
    return val.replace(/(\d{3,4})(?=\d)/g, '$1 ').trim()
  }

  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1)
    if (!digits) return phone

    const ccHints = [
      { code: '55', len: 2 },  // BR
      { code: '52', len: 2 },  // MX
      { code: '54', len: 2 },  // AR
      { code: '56', len: 2 },  // CL
      { code: '57', len: 2 },  // CO
      { code: '58', len: 2 },  // VE
      { code: '502', len: 3 }, // GT
      { code: '503', len: 3 }, // SV
      { code: '504', len: 3 }, // HN
      { code: '505', len: 3 }, // NI
      { code: '506', len: 3 }, // CR
      { code: '507', len: 3 }, // PA
      { code: '509', len: 3 }, // HT
    ]

    const ccLen = ccHints.find((h) => digits.startsWith(h.code))?.len || (digits.length >= 11 ? 2 : 1)
    const cc = digits.slice(0, ccLen)
    const national = digits.slice(ccLen)
    return `+${cc} ${formatNational(national)}`.trim()
  }

  if (cleaned.length === 8) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  if (cleaned.length === 9) return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`
  if (cleaned.length === 11) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  return cleaned
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

export const formatRelative = (value?: string | null) => {
  if (!value) return 'Sin datos'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin datos'
  const now = Date.now()
  const diffMs = date.getTime() - now
  const minutes = Math.round(diffMs / 60000)
  const abs = Math.abs(minutes)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (abs < 1) return 'Ahora'
  if (abs < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(hours / 24)
  return rtf.format(days, 'day')
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
  const personalData = extra.personal_data_screen || {}
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
  const personalNationality = asStringOrNull(personalData.nacionalidad)
  const personalMaritalStatus = asStringOrNull(personalData.estado_civil)
  const personalGender = asStringOrNull(personalData.genero)

  const nationality = acc.nationality || personalNationality || renapEntry?.nacionalidad || flow.nacionalidad || null
  const maritalStatus = acc.marital_status || personalMaritalStatus || renapEntry?.estado_civil || flow.estado_civil || null
  const gender = acc.gender || personalGender || renapEntry?.genero || null

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
