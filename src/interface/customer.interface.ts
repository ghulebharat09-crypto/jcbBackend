export interface CustomerAttributes {
  id: string;
  name: string;
  company_name?: string | null;
  phone: string;
  email?: string | null;
  password_hash?: string | null;
  address?: string | null;
  customer_type: 'individual' | 'corporate';
  is_active: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCustomerInput {
  name: string;
  company_name?: string;
  phone: string;
  email?: string;
  password?: string;
  address?: string;
  customer_type?: 'individual' | 'corporate';
}

export interface UpdateCustomerInput {
  name?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  customer_type?: 'individual' | 'corporate';
  is_active?: boolean;
}

export interface CustomerQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  customer_type?: 'individual' | 'corporate';
  is_active?: boolean;
}
