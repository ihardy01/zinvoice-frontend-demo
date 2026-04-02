import { useQuery, useMutation } from "@tanstack/react-query";
import { invoiceApi } from "@/lib/api/invoice.api";
import {
  PaginationInvoiceParams,
} from "@/types";

export const INVOICE_QUERY_KEYS = {
  all: ["invoices"] as const,
  lists: () => [...INVOICE_QUERY_KEYS.all, "list"] as const,
  list: (params: PaginationInvoiceParams) =>
    [...INVOICE_QUERY_KEYS.lists(), params] as const,
  details: () => [...INVOICE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...INVOICE_QUERY_KEYS.details(), id] as const,
};

export function useInvoices(params: PaginationInvoiceParams, enabled: boolean = true) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.list(params),
    queryFn: () => invoiceApi.getInvoices(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
    enabled: enabled,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.detail(id),
    queryFn: () => invoiceApi.getInvoiceById(id),
    enabled: !!id,
  });
}


export function useInvoiceSerials() {
  return useQuery({
    queryKey: ["invoice-serials"],
    queryFn: () => invoiceApi.getSerials(),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
}


export function usePrintInvoice() {
  return useMutation({
    mutationFn: ({ invoiceId, type }: { invoiceId: string; type?: string }) => 
      invoiceApi.printInvoice(invoiceId, type),
  });
}

export function useDownloadPdfInvoice() {
  return useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.downloadPdf(invoiceId),
  });
}