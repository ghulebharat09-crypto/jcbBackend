export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  company?: string;
  address?: string;
  default_hourly_rate?: number;
  default_daily_rate?: number;
  push_notifications?: boolean;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}
