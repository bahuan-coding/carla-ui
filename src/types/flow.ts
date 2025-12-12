export type FlowStatus = 'draft' | 'active' | 'archived';

export type StepType = 'message' | 'question' | 'api_call' | 'condition' | 'wait';

export type FlowStep = {
  id: string;
  flow_id: string;
  order_index: number;
  type: StepType;
  name: string;
  config: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type WhatsAppFlow = {
  id: string;
  name: string;
  description?: string | null;
  status: FlowStatus;
  icon: string;
  steps_count: number;
  usage_count: number;
  cooperative_id?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  config: Record<string, unknown>;
  steps?: FlowStep[];
};

export type CreateFlowInput = {
  name: string;
  description?: string;
  status?: FlowStatus;
  icon?: string;
  cooperative_id?: string;
  config?: Record<string, unknown>;
};

export type UpdateFlowInput = Partial<CreateFlowInput> & {
  steps_count?: number;
};

export type CreateStepInput = {
  flow_id: string;
  order_index: number;
  type: StepType;
  name: string;
  config?: Record<string, unknown>;
};

export type UpdateStepInput = Partial<Omit<CreateStepInput, 'flow_id'>>;

