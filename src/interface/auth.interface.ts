export interface LoginInput {
  identifier: string; // email or phone
  password: string;
}

export interface SignupInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager';
  admin_key?: string;
  company?: string;
}

export interface ForgotPasswordInput {
  identifier: string; // email or phone
}

export interface ResetPasswordInput {
  identifier: string;
  new_password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}
