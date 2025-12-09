export type DiditDecision = {
  reason?: string;
  status?: string;
  reviews?: unknown[];
  features?: string[];
};

export type DiditRawPayload = {
  status?: string;
  user_id?: string;
  decision?: DiditDecision;
  timestamp?: number;
  created_at?: number;
  session_id?: string;
  vendor_data?: string;
  webhook_type?: string;
  verification_id?: string;
};

export type DiditMetadata = {
  result?: Record<string, unknown>;
  decision?: DiditDecision;
  event_type?: string | null;
  raw_status?: string;
  raw_payload?: DiditRawPayload;
  webhook_received_at?: string;
};

export type PhoneVerificationMetadata = {
  verified_at?: string;
};

export type RenapCitizenEntry = {
  id?: string;
  cui?: string;
  foto?: string;
  genero?: string;
  status?: string;
  user_id?: string;
  vecindad?: string;
  ocupacion?: string;
  account_id?: string;
  created_at?: string;
  query_type?: string;
  completed_at?: string;
  estado_civil?: string;
  nacionalidad?: string;
  orden_cedula?: string | null;
  primer_nombre?: string;
  segundo_nombre?: string | null;
  tercer_nombre?: string | null;
  apellido_casada?: string | null;
  correlativo_dpi?: string;
  fecha_defuncion?: string | null;
  pais_nacimiento?: string;
  primer_apellido?: string;
  registro_cedula?: string | null;
  fecha_nacimiento?: string;
  segundo_apellido?: string;
  fecha_vencimiento?: string;
  request_duration_ms?: number | null;
  municipio_nacimiento?: string;
  departamento_nacimiento?: string;
};

export type RenapCitizenData = {
  id?: string;
  cui?: string;
  status?: string;
  timestamp?: string;
  request_id?: string;
  citizen_data?: RenapCitizenEntry[];
  error_message?: string | null;
};

export type CompleteFlowData = {
  flow_token?: string;
  estado_civil?: string;
  nacionalidad?: string;
  tipo_vivienda?: string;
  nombre_empresa?: string;
  relacion_laboral?: string;
  compliance_checks?: string;
  egresos_mensuales?: string;
  ingresos_mensuales?: string;
  quiere_beneficiario?: string;
  numeroIdentificacion?: string;
  direccion_completa?: string;
  correo_electronico?: string;
  [key: string]: unknown;
};

export type ExtraData = {
  data_source?: string;
  last_screen?: string;
  finalized_at?: string;
  last_updated?: string;
  address_screen?: {
    tipo_vivienda?: string;
    direccion_completa?: string;
    [key: string]: unknown;
  };
  contact_screen?: {
    correo_electronico?: string;
    [key: string]: unknown;
  };
  completion_status?: string;
  compliance_screen?: {
    compliance_checks?: string;
    numeroIdentificacion?: string;
    [key: string]: unknown;
  };
  employment_screen?: {
    nombre_empresa?: string;
    relacion_laboral?: string;
    egresos_mensuales?: string;
    ingresos_mensuales?: string;
    otra_fuente_ingresos?: string;
    [key: string]: unknown;
  };
  flow_completed_at?: string;
  beneficiary_screen?: Record<string, unknown>;
  complete_flow_data?: CompleteFlowData;
  verification_check?: Record<string, unknown>;
  whatsapp_phone_e164?: string | null;
  personal_data_screen?: Record<string, unknown>;
};

export type Account = {
  id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  whatsapp_phone_e164?: string | null;
  document_type?: string;
  document_number?: string;
  document_country?: string;
  channel?: string;
  lead_source?: string | null;
  tags?: string[];
  institution_code?: string;
  institution_name?: string;
  product_type?: string;
  account_currency?: string;
  full_name?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  nationality?: string;
  marital_status?: string;
  married_last_name?: string;
  email?: string | null;
  phone_main?: string | null;
  phone_secondary?: string | null;
  address_full?: string | null;
  address_housing_type?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_country?: string | null;
  employment_status?: string | null;
  employer_name?: string | null;
  monthly_income?: number | null;
  monthly_expenses?: number | null;
  other_income_sources?: string | null;
  is_pep?: boolean;
  is_pep_related?: boolean;
  has_us_tax_obligations?: boolean;
  compliance_checks_raw?: string[];
  status?: string;
  is_demo?: boolean;
  flow_session_id?: string | null;
  integration_attempts?: number;
  last_integration_at?: string | null;
  last_integration_error?: string | null;
  external_account_id?: string | null;
  external_customer_id?: string | null;
  external_request_payload?: unknown;
  external_raw_response?: unknown;
  bank_partner_client_id?: string | null;
  bank_partner_account_id?: string | null;
  bank_blacklist_response?: unknown;
  bank_blacklist_finished_at?: string | null;
  bank_client_response?: unknown;
  bank_client_finished_at?: string | null;
  bank_complementary_response?: unknown;
  bank_complementary_finished_at?: string | null;
  bank_account_response?: unknown;
  bank_account_finished_at?: string | null;
  bank_onboarding_response?: unknown;
  bank_onboarding_finished_at?: string | null;
  bank_complementary_update_response?: unknown;
  bank_complementary_update_finished_at?: string | null;
  bank_complement_query_response?: unknown;
  bank_complement_query_finished_at?: string | null;
  bank_responses?: {
    blacklist?: unknown;
    client?: unknown;
    complementary?: unknown;
    account?: unknown;
    onboarding?: unknown;
    complementary_update?: unknown;
    complement_query?: unknown;
  };
  bank_finished_at?: {
    blacklist?: string;
    client?: string;
    complementary?: string;
    account?: string;
    onboarding?: string;
    complementary_update?: string;
    complement_query?: string;
  };
  phone_verification_status?: string;
  phone_verification_sent_at?: string | null;
  phone_verification_otp_reference?: string | null;
  phone_verification_metadata?: PhoneVerificationMetadata;
  phone_verification_campaign_sent_at?: string | null;
  phone_verification_campaign_message_id?: string | null;
  phone_verification_campaign_response?: string | null;
  phone_verification_campaign_responded_at?: string | null;
  phone_verification_campaign_attempts?: number;
  phone_verification_campaign_metadata?: Record<string, unknown>;
  qic_status?: string | null;
  qic_last_check?: string | null;
  didit_status?: string | null;
  didit_verification_link?: string | null;
  didit_verification_id?: string | null;
  didit_last_check?: string | null;
  didit_metadata?: DiditMetadata;
  renap_status?: string | null;
  renap_citizen_data?: RenapCitizenData | RenapCitizenData[];
  renap_last_check?: string | null;
  renap_metadata?: {
    full_name?: string | null;
    birth_date?: string | null;
    verified_at?: string | null;
  };
  verification_started_at?: string | null;
  verification_completed_at?: string | null;
  verification_metadata?: Record<string, unknown>;
  extra_data?: ExtraData;
};

export type AccountResponse = {
  data?: {
    account?: Account;
    beneficiaries?: unknown[];
    banking_events?: unknown[];
  };
  meta?: Record<string, unknown>;
};


