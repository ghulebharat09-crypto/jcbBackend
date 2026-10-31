export interface UserAttributes {
  id: string;
  name: string;
  phone: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager';
  company?: string | null;
  address?: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager';
  company?: string;
  address?: string;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  address?: string;
  is_active?: boolean;
}

export interface UserResponseDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'manager';
  company?: string | null;
  address?: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}
