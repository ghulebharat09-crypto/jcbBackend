export type InvoiceStatus = 'draft' | 'generated' | 'sent' | 'paid';

export interface InvoiceItemAttributes {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  created_at?: Date;
}

export interface InvoiceAttributes {
  id: string;
  invoice_number: string;
  booking_id: string;
  customer_id: string;
  payment_id?: string | null;
  subtotal: number;
  advance_credit: number;
  total_paid: number;
  status: InvoiceStatus;
  pdf_url?: string | null;
  issued_at: Date | string;
  items?: InvoiceItemAttributes[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

export interface CreateInvoiceInput {
  booking_id: string;
  customer_id: string;
  payment_id?: string;
  items: CreateInvoiceItemInput[];
  subtotal: number;
  advance_credit?: number;
  total_paid: number;
  status?: InvoiceStatus;
  pdf_url?: string;
}
