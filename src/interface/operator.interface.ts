export type OperatorStatus = 'available' | 'on_duty' | 'off_duty';

export interface OperatorAttributes {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  license_number?: string | null;
  status: OperatorStatus;
  assigned_machine_id?: string | null;
  document_url?: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateOperatorInput {
  name: string;
  phone: string;
  email?: string;
  license_number?: string;
  status?: OperatorStatus;
  assigned_machine_id?: string;
  document_url?: string;
}

export interface UpdateOperatorInput {
  name?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  status?: OperatorStatus;
  assigned_machine_id?: string | null;
  document_url?: string;
  is_active?: boolean;
}

export interface OperatorQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: OperatorStatus;
}
