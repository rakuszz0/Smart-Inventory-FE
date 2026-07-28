export type Role = "super_admin" | "admin" | "staff" | "user";

export type User = {
  id: string;
  fullname: string;
  email: string;
  role: Role;
  is_active?: boolean;
  phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
};

export type RegisterPayload = {
  fullname: string;
  email: string;
  password: string;
  confirm_password: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ProfileUpdatePayload = {
  fullname?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
};

export type ApiResponse<T> = T & { detail?: string; message?: string };
