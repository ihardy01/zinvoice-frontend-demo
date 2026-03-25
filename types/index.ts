// ============================================================
// AUTH TYPES
// ============================================================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  avatar?: string;
}

// ============================================================
// INVOICE TYPES
// ============================================================
export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "OVERDUE";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  description?: string;
}

export interface UpdateInvoiceRequest extends CreateInvoiceRequest {
  id: string;
}

// ============================================================
// PAGINATION TYPES
// ============================================================
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
