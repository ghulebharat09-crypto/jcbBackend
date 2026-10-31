export type MachineStatus = 'available' | 'rented_out' | 'maintenance';

export interface MachineAttributes {
  id: string;
  name: string;
  model: string;
  registration_number: string;
  machine_type: string;
  status: MachineStatus;
  hourly_rate: number;
  daily_rate: number;
  base_yard_location: string;
  image_url?: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMachineInput {
  name: string;
  model: string;
  registration_number: string;
  machine_type: string;
  status?: MachineStatus;
  hourly_rate: number;
  daily_rate: number;
  base_yard_location: string;
  image_url?: string;
}

export interface UpdateMachineInput {
  name?: string;
  model?: string;
  registration_number?: string;
  machine_type?: string;
  status?: MachineStatus;
  hourly_rate?: number;
  daily_rate?: number;
  base_yard_location?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface MachineQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: MachineStatus;
  machine_type?: string;
}
