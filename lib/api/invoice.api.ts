import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/config";
import {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  PaginationParams,
  PaginatedResponse,
} from "@/types";

export const invoiceApi = {
  getInvoices: async (
    params: PaginationParams,
  ): Promise<PaginatedResponse<Invoice>> => {
    const response = await axiosInstance.get<PaginatedResponse<Invoice>>(
      API_ENDPOINTS.INVOICES,
      { params },
    );
    return response.data;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(
      API_ENDPOINTS.INVOICE_DETAIL(id),
    );
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await axiosInstance.post<Invoice>(
      API_ENDPOINTS.INVOICES,
      data,
    );
    return response.data;
  },

  updateInvoice: async ({
    id,
    ...data
  }: UpdateInvoiceRequest): Promise<Invoice> => {
    const response = await axiosInstance.put<Invoice>(
      API_ENDPOINTS.INVOICE_DETAIL(id),
      data,
    );
    return response.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.INVOICE_DETAIL(id));
  },
};
