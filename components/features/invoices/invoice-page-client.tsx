"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Home,
  Send, Eye
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import {
  useInvoices,
  useInvoiceSerials,
} from "@/hooks/use-invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card,  } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/index";
import { Separator } from "@/components/ui/index";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PAGE_LIMIT_OPTIONS = [10, 20, 50] as const;

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function InvoicePageClient() {
  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);
  const [series, setSeries] = useState<string>("");


  // ── Data ──
  const { data: serials, isLoading: isSerialsLoading } = useInvoiceSerials();
  useEffect(() => {
    if (serials && serials.length > 0 && !series) {
      setSeries(serials[0].value);
    }
  }, [serials, series]);

  const { data, isLoading, isFetching } = useInvoices(
    { page, limit, series },
    !!series,
  );

  const allInvoices = data?.invoices ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalRecords = data?.pagination?.total ?? 0;




  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Trang chủ</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Hoá đơn</span>
      </nav>
      {/* ── Filter & search bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <Select
          value={series}
          onValueChange={(v) => {
            setSeries(v);
            setPage(1);
          }}
          disabled={isSerialsLoading || !serials?.length}
        >
          <SelectTrigger className="w-[400px]">
            <SelectValue placeholder="Chọn ký hiệu" />
          </SelectTrigger>
          <SelectContent>
            {serials?.map((s) => (
              <SelectItem key={s.id} value={s.value} title={s.invoiceTypeName}>
                {s.invoiceSymbol} - {s.invoiceTypeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* ── Table card ── */}
      <Card>
        {/* Fetching overlay indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang tải dữ liệu...
          </div>
        )}

        <div className="relative overflow-x-auto w-full">
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Trạng thái</TableHead>
                <TableHead>Trạng thái CQT</TableHead>
                <TableHead>Mã CQT</TableHead>
                <TableHead>Ký hiệu</TableHead>
                <TableHead>Ngày HĐ</TableHead>
                <TableHead>Số HĐ</TableHead>
                <TableHead>Mã số thuế</TableHead>
                <TableHead>Tên khách hàng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CCCD</TableHead>
                <TableHead>Mã tra cứu</TableHead>
                <TableHead>Hình thức TT</TableHead>
                <TableHead>Số đơn hàng</TableHead>
                <TableHead className="text-right sticky right-0 bg-white shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Data rows */}
              {!isLoading &&
                allInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group">
                    <TableCell>
                      <Badge variant="outline">{invoice.status || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.taxSubmissionStatus === "Thành công" ? "default" : "secondary"}>
                        {invoice.taxSubmissionStatus || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.idSign || ""}</TableCell>
                    <TableCell className="font-medium">{invoice.invoiceSeries}</TableCell>
                    <TableCell>{invoice.invoiceIssuedDate ? formatDate(invoice.invoiceIssuedDate) : ""}</TableCell>
                    <TableCell className="font-bold text-primary">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.buyerTaxCode}</TableCell>
                    <TableCell>{invoice.buyerDisplayName || invoice.buyerLegalName}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.buyerEmail}</TableCell>
                    <TableCell>{invoice.buyerCitizenId}</TableCell>
                    <TableCell className="font-mono text-xs">{invoice.lookupCode}</TableCell>
                    <TableCell>{invoice.paymentMethodName}</TableCell>
                    <TableCell>{invoice.orderNumber || ""}</TableCell>
                    
                    {/* Cột thao tác (Sticky Right) */}
                    <TableCell className="text-right sticky right-0 bg-white group-hover:bg-muted/50 transition-colors shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Send className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ký và gửi CQT</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Xem hoá đơn</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination footer ── */}
        {!isLoading && totalRecords > 0 && (
          <>
            <Separator />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3">
              
              {/* Khu vực chọn Limit và Thông tin tổng số */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      setLimit(Number(v));
                      setPage(1); // Reset về trang 1 khi đổi số lượng hiển thị
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_LIMIT_OPTIONS.map((n) => (
                         <SelectItem key={n} value={String(n)}>
                           {n}
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>/ trang</span>
                </div>

                <div className="hidden md:block border-l border-border h-4 mx-1"></div>

                <p>
                  {(() => {
                    const start = (page - 1) * limit + 1;
                    const end = Math.min(page * limit, totalRecords);
                    return `Đang xem ${start} - ${end} trên tổng ${totalRecords} hoá đơn`;
                  })()}
                </p>
              </div>

              {/* Khu vực nút điều hướng */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  title="Trang đầu"
                >
                  <ChevronLeft className="h-3.5 w-3.5 -mr-1" />
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Các nút đánh số trang */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) {
                      p = i + 1;
                    } else if (page <= 3) {
                      p = i + 1;
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i;
                    } else {
                      p = page - 2 + i;
                    }
                    return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs font-medium"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  title="Trang cuối"
                >
                  <ChevronRight className="h-3.5 w-3.5 -mr-1" />
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
