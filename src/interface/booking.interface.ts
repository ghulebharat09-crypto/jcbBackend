export type RentalType = 'hourly' | 'daily' | 'weekly';
export type BookingStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface BookingAttributes {
  id: string;
  booking_number: string;
  customer_id: string;
  machine_id: string;
  operator_id?: string | null;
  site_location: string;
  work_description?: string | null;
  start_date: Date | string;
  end_date: Date | string;
  rental_type: RentalType;
  estimated_hours: number;
  base_rate: number;
  estimated_cost: number;
  advance_payment: number;
  remaining_balance: number;
  status: BookingStatus;
  cancelled_reason?: string | null;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBookingInput {
  customer_id: string;
  machine_id: string;
  operator_id?: string;
  site_location: string;
  work_description?: string;
  start_date: string;
  end_date: string;
  rental_type: RentalType;
  estimated_hours?: number;
  advance_payment?: number;
}

export interface UpdateBookingInput {
  customer_id?: string;
  machine_id?: string;
  operator_id?: string | null;
  site_location?: string;
  work_description?: string;
  start_date?: string;
  end_date?: string;
  rental_type?: RentalType;
  estimated_hours?: number;
  advance_payment?: number;
  status?: BookingStatus;
  cancelled_reason?: string;
}

export interface BookingQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  customer_id?: string;
  machine_id?: string;
  from_date?: string;
  to_date?: string;
}
