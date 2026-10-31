export type PaymentType = 'advance' | 'final' | 'partial';
export type PaymentMethod = 'upi' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface PaymentAttributes {
  id: string;
  booking_id: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  base_charge: number;
  overtime_charge: number;
  fuel_transport_charge: number;
  advance_adjustment: number;
  total_amount: number;
  status: PaymentStatus;
  paid_at: Date | string;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreatePaymentInput {
  booking_id: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  base_charge?: number;
  overtime_charge?: number;
  fuel_transport_charge?: number;
  advance_adjustment?: number;
  total_amount: number;
  status?: PaymentStatus;
  notes?: string;
}

export interface BillingCalculationDto {
  booking_id: string;
  customer_name: string;
  machine_name: string;
  start_date: string;
  end_date: string;
  estimated_hours: number;
  base_rate: number;
  base_charge: number;
  suggested_overtime_charge: number;
  suggested_fuel_transport: number;
  advance_received: number;
  total_estimated_payable: number;
  remaining_balance: number;
}
