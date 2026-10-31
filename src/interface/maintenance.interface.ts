export type ServiceType =
  | 'oil_change'
  | 'filter'
  | 'major_service'
  | 'fuel'
  | 'tyres'
  | 'hydraulic'
  | 'other';

export interface MaintenanceAttributes {
  id: string;
  machine_id: string;
  service_title: string;
  service_detail?: string | null;
  service_type: ServiceType;
  service_date: Date | string;
  cost: number;
  performed_by?: string | null;
  next_service_date?: Date | string | null;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMaintenanceInput {
  machine_id: string;
  service_title: string;
  service_detail?: string;
  service_type: ServiceType;
  service_date: string;
  cost: number;
  performed_by?: string;
  next_service_date?: string;
}

export interface UpdateMaintenanceInput {
  machine_id?: string;
  service_title?: string;
  service_detail?: string;
  service_type?: ServiceType;
  service_date?: string;
  cost?: number;
  performed_by?: string;
  next_service_date?: string | null;
}

export interface MaintenanceQueryFilter {
  page?: number;
  limit?: number;
  machine_id?: string;
  service_type?: ServiceType;
  from_date?: string;
  to_date?: string;
}
