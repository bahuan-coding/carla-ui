import { processDetailSchema, processEventSchema, processesAdminSchema } from '@/lib/schemas';

// Demo-friendly sample payloads used when API is unavailable or returns errors.
// Keeps UI populated without needing unsafe eval or inline JS.
export const sampleProcessesAdmin = processesAdminSchema.parse([
  {
    id: 'prc_gt_001',
    account_opening_id: 'acc_gt_01',
    phone: '+50255501111',
    whatsapp_phone_e164: '+50255501111',
    name: 'María González',
    status: 'ready_for_bank',
    banking_status: 'bank_processing',
    verification_status: 'didit_verified',
    attempts: 1,
    events_count: 4,
    last_error: null,
    product_type: 'Cuenta Digital',
    account_currency: 'GTQ',
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    correlation_id: 'gt-corr-001',
  },
  {
    id: 'prc_br_001',
    account_opening_id: 'acc_br_01',
    phone: '+5511984129269',
    whatsapp_phone_e164: '+5511984129269',
    name: null,
    status: 'bank_processing',
    banking_status: 'bank_processing',
    verification_status: 'didit_verified',
    attempts: 0,
    events_count: 2,
    last_error: null,
    product_type: 'Conta Corrente',
    account_currency: 'BRL',
    updated_at: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    correlation_id: 'c0f2-a9a7',
  },
  {
    id: 'prc_gt_002',
    account_opening_id: 'acc_gt_02',
    phone: '+50244447777',
    whatsapp_phone_e164: '+50244447777',
    name: 'Carlos Mendoza',
    status: 'bank_retry',
    banking_status: 'bank_retry',
    verification_status: 'phone_verified',
    attempts: 3,
    events_count: 12,
    last_error: 'Core bancario timeout - reintentar',
    product_type: 'Crédito Simple',
    account_currency: 'GTQ',
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    correlation_id: 'gt-corr-002',
  },
  {
    id: 'prc_br_002',
    account_opening_id: 'acc_br_02',
    phone: '+5521999887766',
    whatsapp_phone_e164: '+5521999887766',
    name: 'Ana Paula Silva',
    status: 'account_created',
    banking_status: 'account_created',
    verification_status: 'didit_verified',
    attempts: 1,
    events_count: 8,
    last_error: null,
    product_type: 'Conta Digital',
    account_currency: 'BRL',
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    correlation_id: 'br-corr-002',
  },
  {
    id: 'prc_gt_003',
    account_opening_id: 'acc_gt_03',
    phone: '+50233338888',
    whatsapp_phone_e164: '+50233338888',
    name: null,
    status: 'bank_rejected',
    banking_status: 'bank_rejected',
    verification_status: 'review_required',
    attempts: 5,
    events_count: 15,
    last_error: 'Cliente en lista negra del banco',
    product_type: 'Tarjeta Crédito',
    account_currency: 'USD',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    correlation_id: 'gt-corr-003',
  },
]);

import { z } from 'zod';

type SampleProcessDetail = z.infer<typeof processDetailSchema>;
type SampleProcessEvent = z.infer<typeof processEventSchema>;

const sampleProcessDetailsMap: Record<string, SampleProcessDetail> = {
  prc_gt_001: processDetailSchema.parse({
    ...sampleProcessesAdmin[0],
    account: {
      id: 'acc_demo_01',
      full_name: 'Juana Demo',
      birth_date: '1994-03-12',
      gender: 'F',
      nationality: 'Guatemala',
      marital_status: 'Soltera',
      email: 'juana.demo@example.com',
      phone_main: '+50255501111',
      phone_secondary: '+50255501112',
      whatsapp_phone_e164: '+50255501111',
      address_full: '14 Avenida 12-30, Zona 10, Guatemala',
      address_city: 'Guatemala',
      address_state: 'Guatemala',
      address_country: 'GT',
      address_housing_type: 'Propia',
      employment_status: 'Empleado',
      employer_name: 'ACME Corp',
      monthly_income: 7200,
      monthly_expenses: 2800,
      other_income_sources: 'Remesas',
      document_type: 'DPI',
      document_number: '1234567890101',
      document_country: 'GT',
      product_type: 'Cuenta digital',
      account_currency: 'GTQ',
      renap_status: 'ok',
      renap_citizen_data: {
        citizen_data: [
          {
            cui: '1234567890101',
            primer_nombre: 'Juana',
            segundo_nombre: 'María',
            primer_apellido: 'Demo',
            segundo_apellido: 'García',
            fecha_nacimiento: '1994-03-12',
            nacionalidad: 'Guatemala',
            estado_civil: 'Soltera',
            vecindad: 'Guatemala',
            fecha_vencimiento: '2030-01-01',
          },
        ],
      },
      phone_verification_status: 'verified',
      phone_verification_metadata: { verified_at: '2025-01-15T11:50:00Z' },
      qic_status: 'clear',
      didit_status: 'clear',
      didit_verification_link: 'https://verify.example.com/session/demo',
      didit_last_check: '2025-01-15T11:48:00Z',
      renap_last_check: '2025-01-15T11:46:00Z',
      verification_started_at: '2025-01-15T11:40:00Z',
      verification_completed_at: '2025-01-15T11:52:00Z',
      is_pep: false,
      is_pep_related: false,
      has_us_tax_obligations: false,
      compliance_checks_raw: ['pepCheck:clear'],
      extra_data: {
        complete_flow_data: {
          estado_civil: 'Soltera',
          nacionalidad: 'Guatemala',
          tipo_vivienda: 'Propia',
          direccion_completa: '14 Avenida 12-30, Zona 10, Guatemala',
          correo_electronico: 'juana.demo@example.com',
          nombre_empresa: 'ACME Corp',
          relacion_laboral: 'Empleado',
          ingresos_mensuales: '7200',
          egresos_mensuales: '2800',
          compliance_checks: 'pepCheck:clear',
        },
      },
      bank_blacklist_finished_at: '2025-01-15T11:30:00Z',
      bank_onboarding_finished_at: '2025-01-15T11:45:00Z',
      bank_account_finished_at: null,
      bank_complementary_finished_at: '2025-01-15T11:55:00Z',
    },
    timeline: [
      {
        id: 'evt_demo_01',
        type: 'verification',
        status: 'ok',
        step: 'documento',
        message: 'Documento validado',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:42:00Z',
        payload: { source: 'didit' },
      },
      {
        id: 'evt_demo_02',
        type: 'verification',
        status: 'ok',
        step: 'renap',
        message: 'RENAP coincide',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:46:00Z',
        payload: { match: true },
      },
      {
        id: 'evt_demo_03',
        type: 'bank',
        status: 'processing',
        step: 'blacklist',
        message: 'Enviada a blacklist',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:50:00Z',
      },
      {
        id: 'evt_demo_04',
        type: 'bank',
        status: 'processing',
        step: 'onboarding',
        message: 'Onboarding iniciado',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:52:00Z',
      },
    ],
    banking_events: [
      {
        id: 'evt_demo_bank_01',
        type: 'bank',
        status: 'processing',
        step: 'blacklist',
        message: 'Blacklist clear',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:30:00Z',
        payload: { result: 'clear' },
      },
      {
        id: 'evt_demo_bank_02',
        type: 'bank',
        status: 'processing',
        step: 'onboarding',
        message: 'Onboarding enviado',
        correlation_id: 'corr-demo-123',
        created_at: '2025-01-15T11:45:00Z',
        payload: { account_type: 'Cuenta digital' },
      },
    ],
  }),
  prc_br_001: processDetailSchema.parse({
    ...sampleProcessesAdmin[1],
    account: {
      id: 'acc_demo_02',
      full_name: 'Carlos Sample',
      birth_date: '1990-07-22',
      gender: 'M',
      nationality: 'Guatemala',
      marital_status: 'Casado',
      email: 'carlos.sample@example.com',
      phone_main: '+50255502222',
      address_full: '6a Avenida 4-55, Zona 14, Guatemala',
      address_city: 'Guatemala',
      address_state: 'Guatemala',
      address_country: 'GT',
      employment_status: 'Independiente',
      employer_name: 'Consultor',
      monthly_income: 5200,
      monthly_expenses: 3100,
      document_type: 'DPI',
      document_number: '1098765432101',
      document_country: 'GT',
      renap_status: 'ok',
      renap_citizen_data: {
        citizen_data: [
          {
            cui: '1098765432101',
            primer_nombre: 'Carlos',
            primer_apellido: 'Sample',
            fecha_nacimiento: '1990-07-22',
            nacionalidad: 'Guatemala',
            estado_civil: 'Casado',
            fecha_vencimiento: '2029-07-22',
          },
        ],
      },
      phone_verification_status: 'retry',
      phone_verification_metadata: { verified_at: null },
      qic_status: 'pending',
      didit_status: 'manual_review',
      renap_last_check: '2025-01-15T11:20:00Z',
      verification_started_at: '2025-01-15T11:00:00Z',
      verification_completed_at: null,
      is_pep: false,
      is_pep_related: false,
      has_us_tax_obligations: false,
      compliance_checks_raw: ['pepCheck:clear'],
      extra_data: {
        complete_flow_data: {
          estado_civil: 'Casado',
          nacionalidad: 'Guatemala',
          tipo_vivienda: 'Rentada',
          direccion_completa: '6a Avenida 4-55, Zona 14, Guatemala',
          correo_electronico: 'carlos.sample@example.com',
          ingresos_mensuales: '5200',
          egresos_mensuales: '3100',
          compliance_checks: 'pepCheck:clear',
        },
      },
      bank_blacklist_finished_at: '2025-01-15T11:05:00Z',
      bank_onboarding_finished_at: null,
      bank_account_finished_at: null,
      bank_complementary_finished_at: null,
    },
    timeline: [
      {
        id: 'evt_demo_05',
        type: 'verification',
        status: 'warn',
        step: 'didit',
        message: 'Documento borroso, requiere retry',
        correlation_id: 'corr-demo-456',
        created_at: '2025-01-15T11:10:00Z',
        payload: { attempt: 1 },
      },
      {
        id: 'evt_demo_06',
        type: 'verification',
        status: 'warn',
        step: 'otp',
        message: 'OTP no contestado',
        correlation_id: 'corr-demo-456',
        created_at: '2025-01-15T11:18:00Z',
      },
      {
        id: 'evt_demo_07',
        type: 'bank',
        status: 'retry',
        step: 'onboarding',
        message: 'Banco pidió retry',
        correlation_id: 'corr-demo-456',
        created_at: '2025-01-15T11:35:00Z',
      },
    ],
    banking_events: [
      {
        id: 'evt_demo_bank_03',
        type: 'bank',
        status: 'retry',
        step: 'onboarding',
        message: 'Campos faltantes',
        correlation_id: 'corr-demo-456',
        created_at: '2025-01-15T11:34:00Z',
        payload: { missing: ['address_full'] },
      },
    ],
  }),
};

const sampleProcessEventsMap: Record<string, SampleProcessEvent[]> = {
  prc_gt_001: sampleProcessDetailsMap.prc_gt_001.timeline || [],
  prc_br_001: sampleProcessDetailsMap.prc_br_001.timeline || [],
};

export const sampleProcessDetailById = (id?: string) => {
  const detail = id ? sampleProcessDetailsMap[id] : undefined;
  if (detail) return detail;
  return sampleProcessDetailsMap.prc_gt_001;
};

export const sampleProcessEventsById = (id?: string) => {
  const events = id ? sampleProcessEventsMap[id] : undefined;
  if (events) return events;
  return sampleProcessEventsMap.prc_gt_001;
};

// Sample Conversations - fallback when API unavailable
import { conversationListSchema, conversationDetailSchema } from '@/lib/schemas';

export type ConversationChannel = 'whatsapp' | 'web' | 'telegram' | 'instagram';
export type ConversationStatus = 'active' | 'pending' | 'resolved' | 'archived' | string;

export type SampleConversation = {
  id: string;
  customer_name: string;
  phone: string;
  customer_email?: string;
  channel: ConversationChannel;
  product: string;
  productColor: string;
  status: ConversationStatus;
  process_id?: string;
  process_status?: string;
  unread_count: number;
  last_message: string;
  last_message_at: string;
  last_message_direction?: 'inbound' | 'outbound';
  tags: string[];
  ai_enabled: boolean;
  assigned_agent: string | null;
  profile?: {
    full_name: string;
    phone: string;
    email: string;
    document_type: string;
    document_number: string;
    location: string;
    birth_date: string;
  };
  transaction: {
    id: string;
    name: string;
    status: string;
    stage: string;
    progress: number;
  } | null;
};

const now = Date.now();

export const sampleConversationsRich: SampleConversation[] = [
  {
    id: 'conv_001',
    customer_name: 'Juan Pérez',
    phone: '+52 55 1234 5678',
    customer_email: 'juan.perez@gmail.com',
    channel: 'whatsapp',
    product: 'savings',
    productColor: 'amber',
    status: 'bank_processing',
    process_id: 'TXN-2024-1089',
    process_status: 'bank_processing',
    unread_count: 2,
    last_message: 'Gracias, ya envié los documentos que me solicitaron',
    last_message_at: new Date(now - 1000 * 60 * 23).toISOString(),
    last_message_direction: 'inbound',
    tags: ['Crédito Personal', 'Documentos Pendientes'],
    assigned_agent: null,
    ai_enabled: true,
    profile: {
      full_name: 'Juan Pérez González',
      phone: '+52 55 1234 5678',
      email: 'juan.perez@gmail.com',
      document_type: 'INE',
      document_number: '123****101',
      location: 'Ciudad de México',
      birth_date: '1990-05-15',
    },
    transaction: {
      id: 'TXN-2024-1089',
      name: 'savings',
      status: 'bank_processing',
      stage: 'Creando Cliente',
      progress: 60,
    },
  },
  {
    id: 'conv_002',
    customer_name: 'María García',
    phone: '+52 55 2345 6789',
    customer_email: 'maria.garcia@gmail.com',
    channel: 'web',
    product: 'savings',
    productColor: 'emerald',
    status: 'phone_verified',
    process_id: 'TXN-2024-1157',
    process_status: 'phone_verified',
    unread_count: 0,
    last_message: '¿Cuánto tiempo tarda la verificación de identidad?',
    last_message_at: new Date(now - 1000 * 60 * 15).toISOString(),
    last_message_direction: 'inbound',
    tags: ['Apertura de Cuenta', 'KYC'],
    assigned_agent: null,
    ai_enabled: false,
    profile: {
      full_name: 'María García López',
      phone: '+52 55 2345 6789',
      email: 'maria.garcia@gmail.com',
      document_type: 'INE',
      document_number: '456****202',
      location: 'Guadalajara',
      birth_date: '1988-11-22',
    },
    transaction: {
      id: 'TXN-2024-1157',
      name: 'savings',
      status: 'phone_verified',
      stage: 'Teléfono Verificado',
      progress: 30,
    },
  },
  {
    id: 'conv_005',
    customer_name: 'Roberto Silva',
    phone: '+52 55 5678 9012',
    customer_email: 'roberto.silva@gmail.com',
    channel: 'whatsapp',
    product: 'savings',
    productColor: 'cyan',
    status: 'ready_for_bank',
    process_id: 'TXN-2024-1245',
    process_status: 'ready_for_bank',
    unread_count: 5,
    last_message: 'Necesito ayuda con la firma digital del contrato',
    last_message_at: new Date(now - 1000 * 60 * 30).toISOString(),
    last_message_direction: 'inbound',
    tags: ['Firma Digital', 'Contrato Pendiente'],
    assigned_agent: null,
    ai_enabled: true,
    profile: {
      full_name: 'Roberto Silva Martínez',
      phone: '+52 55 5678 9012',
      email: 'roberto.silva@gmail.com',
      document_type: 'INE',
      document_number: '789****303',
      location: 'Monterrey',
      birth_date: '1985-03-10',
    },
    transaction: {
      id: 'TXN-2024-1245',
      name: 'savings',
      status: 'ready_for_bank',
      stage: 'Listo para Banco',
      progress: 50,
    },
  },
];

// Mensajes realísticos por conversa
const sampleMessagesMap: Record<string, Array<{ id: string; from: string; body: string; at: string; direction: 'in' | 'out' }>> = {
  conv_001: [
    { id: 'm1', from: 'Juan Pérez', body: 'Hola, quisiera solicitar un crédito personal', at: new Date(now - 1000 * 60 * 60).toISOString(), direction: 'in' },
    { id: 'm2', from: 'Carla IA', body: '¡Hola Juan! Con gusto te ayudo. Para iniciar tu solicitud necesitamos: INE vigente, comprobante de domicilio y últimos 3 recibos de nómina. ¿Los tienes disponibles?', at: new Date(now - 1000 * 60 * 58).toISOString(), direction: 'out' },
    { id: 'm3', from: 'Juan Pérez', body: 'Sí, los tengo todos. ¿Cómo los envío?', at: new Date(now - 1000 * 60 * 55).toISOString(), direction: 'in' },
    { id: 'm4', from: 'Carla IA', body: 'Perfecto. Puedes enviarlos como fotos por este mismo chat. Asegúrate de que sean legibles y estén completos.', at: new Date(now - 1000 * 60 * 53).toISOString(), direction: 'out' },
    { id: 'm5', from: 'Juan Pérez', body: 'Gracias, ya envié los documentos que me solicitaron', at: new Date(now - 1000 * 60 * 23).toISOString(), direction: 'in' },
  ],
  conv_002: [
    { id: 'm1', from: 'María García', body: 'Buenos días, quiero abrir una cuenta digital', at: new Date(now - 1000 * 60 * 45).toISOString(), direction: 'in' },
    { id: 'm2', from: 'Carla IA', body: '¡Bienvenida María! La apertura de cuenta digital es 100% en línea y toma solo 5 minutos. Necesitaremos verificar tu identidad con una selfie y tu INE.', at: new Date(now - 1000 * 60 * 43).toISOString(), direction: 'out' },
    { id: 'm3', from: 'María García', body: 'Ya hice la verificación con selfie. ¿Cuánto tiempo tarda la verificación de identidad?', at: new Date(now - 1000 * 60 * 15).toISOString(), direction: 'in' },
  ],
  conv_005: [
    { id: 'm1', from: 'Roberto Silva', body: 'Hola, tengo un problema con la firma digital', at: new Date(now - 1000 * 60 * 40).toISOString(), direction: 'in' },
    { id: 'm2', from: 'Carla IA', body: 'Hola Roberto. ¿Qué problema tienes con la firma? ¿El enlace no funciona o hay algún error?', at: new Date(now - 1000 * 60 * 38).toISOString(), direction: 'out' },
    { id: 'm3', from: 'Roberto Silva', body: 'El enlace sí abre pero cuando intento firmar no pasa nada', at: new Date(now - 1000 * 60 * 35).toISOString(), direction: 'in' },
    { id: 'm4', from: 'Carla IA', body: 'Entiendo. ¿Podrías intentar desde otro navegador como Chrome o Safari? A veces hay incompatibilidades.', at: new Date(now - 1000 * 60 * 33).toISOString(), direction: 'out' },
    { id: 'm5', from: 'Roberto Silva', body: 'Necesito ayuda con la firma digital del contrato', at: new Date(now - 1000 * 60 * 30).toISOString(), direction: 'in' },
  ],
};

export const sampleConversations = conversationListSchema.parse(
  sampleConversationsRich.map((c) => ({
    id: c.id,
    customer_name: c.customer_name,
    phone: c.phone,
    customer_email: c.customer_email,
    last_message: c.last_message,
    last_message_at: c.last_message_at,
    last_message_direction: c.last_message_direction,
    unread_count: c.unread_count,
    status: c.status,
    product: c.product,
    process_id: c.process_id,
    process_status: c.process_status,
    channel: c.channel,
    ai_enabled: c.ai_enabled,
    assigned_agent: c.assigned_agent,
    tags: c.tags,
    // Legacy fields
    name: c.customer_name,
    unread: c.unread_count,
    updatedAt: c.last_message_at,
  }))
);

export const sampleConversationDetailById = (id?: string) => {
  const conv = sampleConversationsRich.find((c) => c.id === id) || sampleConversationsRich[0];
  const messages = sampleMessagesMap[conv.id] || [];
  return conversationDetailSchema.parse({
    id: conv.id,
    customer_name: conv.customer_name,
    phone: conv.phone,
    customer_email: conv.customer_email,
    product: conv.product,
    status: conv.status,
    unread_count: conv.unread_count,
    channel: conv.channel,
    ai_enabled: conv.ai_enabled,
    assigned_agent: conv.assigned_agent,
    tags: conv.tags,
    profile: conv.profile,
    transaction: conv.transaction,
    messages,
    // Legacy fields
    name: conv.customer_name,
    unread: conv.unread_count,
  });
};

// Exportar dados enriquecidos para a UI
export const getConversationRich = (id: string) => sampleConversationsRich.find((c) => c.id === id);

