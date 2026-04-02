export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedInvoiceResponse<T> {
  invoices: T[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T = unknown> {
  metadata: T;
  message: string;
  success: boolean;
  status: number | string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}