export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  apiVersion: "/api/v1",
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",

  // User
  USER_INFO: "/user/me",

  // Invoice
  SERIES: "/invoice/serials",
  INVOICES: "/invoice",
  INVOICE_DETAIL: (id: string) => `/invoice/${id}`,
};
