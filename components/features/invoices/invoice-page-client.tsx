"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Home,
  RotateCcw,
  ChevronsUpDown,
} from "lucide-react";

import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoice";
import { Invoice, InvoiceStatus } from "@/types";
import { formatCurrency, formatDate, INVOICE_STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/index";
import { Separator } from "@/components/ui/index";
import { InvoiceForm } from "./invoice-form";
import { DeleteInvoiceDialog } from "./delete-invoice-dialog";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PAGE_LIMIT_OPTIONS = [10, 20, 50] as const;

type SortField =
  | "invoiceNumber"
  | "customerName"
  | "amount"
  | "issueDate"
  | "dueDate";
type SortDir = "asc" | "desc";

const STATUS_FILTER_OPTIONS: { value: InvoiceStatus | "ALL"; label: string }[] =
  [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ thanh toán" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "CANCELLED", label: "Đã huỷ" },
    { value: "OVERDUE", label: "Quá hạn" },
  ];

const STATUS_BADGE_VARIANT: Record<
  InvoiceStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  PENDING: "warning",
  PAID: "success",
  CANCELLED: "outline",
  OVERDUE: "destructive",
};

const STAT_CARDS = [
  {
    key: "total" as const,
    label: "Tổng hoá đơn",
    icon: FileText,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950",
  },
  {
    key: "paid" as const,
    label: "Đã thanh toán",
    icon: CheckCircle2,
    colorClass: "text-green-600",
    bgClass: "bg-green-50 dark:bg-green-950",
  },
  {
    key: "pending" as const,
    label: "Chờ thanh toán",
    icon: Clock,
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-50 dark:bg-yellow-950",
  },
  {
    key: "overdue" as const,
    label: "Quá hạn",
    icon: AlertCircle,
    colorClass: "text-red-600",
    bgClass: "bg-red-50 dark:bg-red-950",
  },
  {
    key: "cancelled" as const,
    label: "Đã huỷ",
    icon: XCircle,
    colorClass: "text-slate-500",
    bgClass: "bg-slate-100 dark:bg-slate-800",
  },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function InvoicePageClient() {
  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);

  // ── Filters / sort (client-side on current page) ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">(
    "ALL",
  );
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Dialog state ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  // ── Data ──
  const { data, isLoading, isFetching } = useInvoices({ page, limit });
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

  const allInvoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ── Derived stats (entire current page for quick numbers) ──
  const stats = useMemo(
    () => ({
      total: data?.total ?? 0,
      paid: allInvoices.filter((i) => i.status === "PAID").length,
      pending: allInvoices.filter((i) => i.status === "PENDING").length,
      overdue: allInvoices.filter((i) => i.status === "OVERDUE").length,
      cancelled: allInvoices.filter((i) => i.status === "CANCELLED").length,
    }),
    [allInvoices, data?.total],
  );

  // ── Client-side filter + sort on current page's data ──
  const filteredInvoices = useMemo(() => {
    let list = [...allInvoices];

    if (statusFilter !== "ALL") {
      list = list.filter((i) => i.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.customerEmail.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;
      if (sortField === "amount") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal);
        bVal = String(bVal);
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [allInvoices, search, statusFilter, sortField, sortDir]);

  // ── Handlers ──
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingInvoice(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingInvoice) return;
    deleteInvoice(deletingInvoice.id, {
      onSuccess: () => setDeletingInvoice(null),
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "ALL";

  // ── Sort indicator helper ──
  const SortIcon = ({ field }: { field: SortField }) => (
    <ChevronsUpDown
      className={cn(
        "ml-1 h-3.5 w-3.5 inline-block transition-opacity",
        sortField === field ? "opacity-100 text-primary" : "opacity-30",
      )}
    />
  );

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

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý hoá đơn</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tạo mới, chỉnh sửa, xoá và theo dõi trạng thái tất cả hoá đơn.
          </p>
        </div>

        {/* Create dialog trigger */}
        <Dialog
          open={isFormOpen && !editingInvoice}
          onOpenChange={(open) => {
            if (!open) setIsFormOpen(false);
            else {
              setEditingInvoice(null);
              setIsFormOpen(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Tạo hoá đơn
            </Button>
          </DialogTrigger>
          {isFormOpen && !editingInvoice && (
            <InvoiceForm invoice={null} onSuccess={handleFormSuccess} />
          )}
        </Dialog>
      </div>

      {/* ── Edit dialog (controlled separately) ── */}
      <Dialog
        open={isFormOpen && !!editingInvoice}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingInvoice(null);
          }
        }}
      >
        {isFormOpen && editingInvoice && (
          <InvoiceForm invoice={editingInvoice} onSuccess={handleFormSuccess} />
        )}
      </Dialog>

      {/* ── Delete confirm ── */}
      <DeleteInvoiceDialog
        invoice={deletingInvoice}
        isOpen={!!deletingInvoice}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingInvoice(null)}
      />

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_CARDS.map((cfg) => (
          <Card
            key={cfg.key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md border",
              statusFilter ===
                (cfg.key === "total" ? "ALL" : cfg.key.toUpperCase())
                ? "ring-2 ring-primary"
                : "",
            )}
            onClick={() => {
              if (cfg.key === "total") {
                setStatusFilter("ALL");
              } else {
                setStatusFilter(cfg.key.toUpperCase() as InvoiceStatus);
              }
              setPage(1);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
                {cfg.label}
              </CardTitle>
              <div className={cn("p-1.5 rounded-md", cfg.bgClass)}>
                <cfg.icon className={cn("h-3.5 w-3.5", cfg.colorClass)} />
              </div>
            </CardHeader>
            <CardContent className="pb-4 px-4">
              {isLoading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className="text-2xl font-bold leading-none">
                  {cfg.key === "total" ? stats.total : stats[cfg.key]}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filter & search bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Tìm theo tên, email, số hoá đơn..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as InvoiceStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rows per page */}
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            setLimit(Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_LIMIT_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-muted-foreground">Đang lọc:</span>
          {statusFilter !== "ALL" && (
            <Badge variant="secondary" className="gap-1">
              {INVOICE_STATUS_LABELS[statusFilter]}
              <button
                onClick={() => setStatusFilter("ALL")}
                className="ml-1 rounded-full hover:text-destructive transition-colors"
              >
                ×
              </button>
            </Badge>
          )}
          {search.trim() && (
            <Badge variant="secondary" className="gap-1">
              &ldquo;{search}&rdquo;
              <button
                onClick={() => setSearch("")}
                className="ml-1 rounded-full hover:text-destructive transition-colors"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* ── Table card ── */}
      <Card>
        {/* Fetching overlay indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang tải dữ liệu...
          </div>
        )}

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="w-[150px] cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("invoiceNumber")}
                >
                  Số hoá đơn
                  <SortIcon field="invoiceNumber" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("customerName")}
                >
                  Khách hàng
                  <SortIcon field="customerName" />
                </TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead
                  className="text-right cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("amount")}
                >
                  Số tiền
                  <SortIcon field="amount" />
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead
                  className="hidden lg:table-cell cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("issueDate")}
                >
                  Phát hành
                  <SortIcon field="issueDate" />
                </TableHead>
                <TableHead
                  className="hidden lg:table-cell cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("dueDate")}
                >
                  Đến hạn
                  <SortIcon field="dueDate" />
                </TableHead>
                <TableHead className="w-[90px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading skeleton rows */}
              {isLoading &&
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* Empty state */}
              {!isLoading && filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-20" />
                      <p className="font-medium text-sm">
                        {hasActiveFilters
                          ? "Không tìm thấy hoá đơn phù hợp"
                          : "Chưa có hoá đơn nào"}
                      </p>
                      {hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Xoá bộ lọc
                        </Button>
                      ) : (
                        <p className="text-xs">
                          Nhấn &ldquo;Tạo hoá đơn&rdquo; để bắt đầu
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Data rows */}
              {!isLoading &&
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group">
                    <TableCell className="font-mono text-xs font-semibold tracking-wide">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm leading-tight">
                          {invoice.customerName}
                        </p>
                        {/* Email shown inline on small screens */}
                        <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                          {invoice.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {invoice.customerEmail}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[invoice.status]}>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Xoá"
                          onClick={() => setDeletingInvoice(invoice)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination footer ── */}
        {!isLoading && (data?.total ?? 0) > 0 && (
          <>
            <Separator />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {filteredInvoices.length < allInvoices.length ? (
                  <>
                    Hiển thị{" "}
                    <span className="font-medium text-foreground">
                      {filteredInvoices.length}
                    </span>{" "}
                    kết quả lọc trong{" "}
                    <span className="font-medium text-foreground">
                      {allInvoices.length}
                    </span>{" "}
                    hoá đơn trang này
                  </>
                ) : (
                  <>
                    Trang{" "}
                    <span className="font-medium text-foreground">{page}</span>{" "}
                    / {totalPages} &mdash; Tổng{" "}
                    <span className="font-medium text-foreground">
                      {data?.total ?? 0}
                    </span>{" "}
                    hoá đơn
                  </>
                )}
              </p>

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

                {/* Page number pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current
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
                        className="h-8 w-8 text-xs"
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
