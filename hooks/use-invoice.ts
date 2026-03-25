import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invoiceApi } from "@/lib/api/invoice.api";
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  PaginationParams,
} from "@/types";

export const INVOICE_QUERY_KEYS = {
  all: ["invoices"] as const,
  lists: () => [...INVOICE_QUERY_KEYS.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...INVOICE_QUERY_KEYS.lists(), params] as const,
  details: () => [...INVOICE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...INVOICE_QUERY_KEYS.details(), id] as const,
};

// -----------------------------------------------
// useInvoices - list with pagination
// -----------------------------------------------
export function useInvoices(params: PaginationParams) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.list(params),
    queryFn: () => invoiceApi.getInvoices(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}

// -----------------------------------------------
// useInvoice - single by id
// -----------------------------------------------
export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.detail(id),
    queryFn: () => invoiceApi.getInvoiceById(id),
    enabled: !!id,
  });
}

// -----------------------------------------------
// useCreateInvoice
// -----------------------------------------------
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => invoiceApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
      toast.success("Tạo hoá đơn thành công!");
    },
    onError: () => {
      toast.error("Không thể tạo hoá đơn. Vui lòng thử lại.");
    },
  });
}

// -----------------------------------------------
// useUpdateInvoice
// -----------------------------------------------
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceRequest) => invoiceApi.updateInvoice(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: INVOICE_QUERY_KEYS.detail(variables.id),
      });
      toast.success("Cập nhật hoá đơn thành công!");
    },
    onError: () => {
      toast.error("Không thể cập nhật hoá đơn. Vui lòng thử lại.");
    },
  });
}

// -----------------------------------------------
// useDeleteInvoice
// -----------------------------------------------
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_QUERY_KEYS.lists() });
      toast.success("Xoá hoá đơn thành công!");
    },
    onError: () => {
      toast.error("Không thể xoá hoá đơn. Vui lòng thử lại.");
    },
  });
}
