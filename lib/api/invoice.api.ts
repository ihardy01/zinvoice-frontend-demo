import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/config";
import {
  Invoice,
  PaginationInvoiceParams,
  InvoiceSerial,
  ApiResponse,
  PaginatedInvoiceResponse
} from "@/types";

export const invoiceApi = {
  getInvoices: async (
    params: PaginationInvoiceParams,
  ): Promise<PaginatedInvoiceResponse<Invoice>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedInvoiceResponse<Invoice>>>(
      API_ENDPOINTS.INVOICES,
      { params },
    );
    return response.data.metadata;
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(
      API_ENDPOINTS.INVOICE_DETAIL(id),
    );
    return response.data;
  },

  getSerials: async (): Promise<InvoiceSerial[]> => {
    // Nếu bạn có khai báo trong API_ENDPOINTS thì dùng config, nếu không dùng path trực tiếp
    const response = await axiosInstance.get<ApiResponse<InvoiceSerial[]>>(API_ENDPOINTS.SERIES);
    return response.data.metadata;
  },
  printInvoice: async (invoiceId: string, type: string = "html"): Promise<string> => {
    // Đảm bảo endpoint khớp với cấu hình API của bạn
    const response = await axiosInstance.get(
      `/invoice/print`, 
      { params: { invoiceId, type } }
    );
    // Tuỳ thuộc vào API trả về raw HTML hay bọc trong object. Giả sử trả về bọc trong metadata hoặc raw data:
    return response.data?.metadata || response.data;
  },
  downloadPdf: async (invoiceId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/invoice/print`, {
      params: { 
        invoiceId, 
        type: "binary" // Chuyển sang binary theo yêu cầu
      },
      // Bắt buộc phải có responseType: "blob" để Axios hiểu và xử lý đúng file nhị phân
      responseType: "blob", 
    });
    return response.data;
  },
};
