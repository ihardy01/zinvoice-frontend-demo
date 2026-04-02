"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
  Send, 
  Eye,
  Download,
  Plus,
  RefreshCw,
  Settings2,
  GripVertical
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Invoice } from "@/types";

// ─────────────────────────────────────────────
// Constants & Column Configurations
// ─────────────────────────────────────────────
const PAGE_LIMIT_OPTIONS = [10, 20, 50] as const;

type ColumnConfig = {
  id: string;
  label: string;
  isDefault: boolean;
  isVisible: boolean;
  align?: "left" | "center" | "right";
  width: number; // Thêm thiết lập px mặc định
};

const INITIAL_COLUMNS: ColumnConfig[] = [
  // Cột mặc định
  { id: 'status', label: 'Trạng thái', isDefault: true, isVisible: true, width: 120 },
  { id: 'taxSubmissionStatus', label: 'Trạng thái CQT', isDefault: true, isVisible: true, width: 140 },
  { id: 'idSign', label: 'Mã CQT', isDefault: true, isVisible: true, width: 250 },
  { id: 'invoiceSeries', label: 'Ký hiệu', isDefault: true, isVisible: true, width: 100 },
  { id: 'invoiceIssuedDate', label: 'Ngày HĐ', isDefault: true, isVisible: true, width: 110 },
  { id: 'invoiceNumber', label: 'Số HĐ', isDefault: true, isVisible: true, width: 100 },
  { id: 'buyerTaxCode', label: 'Mã số thuế', isDefault: true, isVisible: true, width: 130 },
  { id: 'buyerName', label: 'Tên khách hàng', isDefault: true, isVisible: true, width: 220 },
  { id: 'totalAmount', label: 'Tổng tiền', isDefault: true, isVisible: true, align: 'right', width: 140 },
  { id: 'buyerEmail', label: 'Email', isDefault: true, isVisible: true, width: 180 },
  { id: 'buyerCitizenId', label: 'CCCD', isDefault: true, isVisible: true, width: 140 },
  { id: 'lookupCode', label: 'Mã tra cứu', isDefault: true, isVisible: true, width: 120 },
  { id: 'paymentMethodName', label: 'Hình thức TT', isDefault: true, isVisible: true, width: 150 },
  { id: 'orderNumber', label: 'Số đơn hàng', isDefault: true, isVisible: true, width: 120 },
  // Cột bổ sung
  { id: 'creator', label: 'Người lập', isDefault: false, isVisible: false, width: 150 },
  { id: 'totalAmountWithoutVat', label: 'Tổng tiền chưa thuế', isDefault: false, isVisible: false, align: 'right', width: 160 },
  { id: 'vatAmount', label: 'Tổng tiền thuế', isDefault: false, isVisible: false, align: 'right', width: 140 },
  { id: 'sellerAddress', label: 'Địa chỉ người bán', isDefault: false, isVisible: false, width: 250 },
  { id: 'currency', label: 'Đơn vị tiền tệ', isDefault: false, isVisible: false, width: 120 },
  { id: 'exchangeRate', label: 'Tỷ giá', isDefault: false, isVisible: false, width: 100 },
  { id: 'buyerLegalName', label: 'Tên đơn vị', isDefault: false, isVisible: false, width: 220 },
  { id: 'buyerAddressLine', label: 'Địa chỉ người mua', isDefault: false, isVisible: false, width: 250 },
  { id: 'storeName', label: 'Tên cửa hàng', isDefault: false, isVisible: false, width: 180 },
  { id: 'storeAddress', label: 'Địa chỉ cửa hàng', isDefault: false, isVisible: false, width: 250 },
  { id: 'storeId', label: 'Mã cửa hàng', isDefault: false, isVisible: false, width: 120 },
  { id: 'buyerBudgetRelationCode', label: 'Mã ĐVQHNS', isDefault: false, isVisible: false, width: 150 },
  { id: 'buyerPassport', label: 'Hộ chiếu', isDefault: false, isVisible: false, width: 140 },
  { id: 'totalAmountInWords', label: 'Tổng tiền bằng chữ', isDefault: false, isVisible: false, width: 300 },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function InvoicePageClient() {
  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);
  const [series, setSeries] = useState<string>("");

  // ── Columns State ──
  const [columnsConfig, setColumnsConfig] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [draftColumns, setDraftColumns] = useState<ColumnConfig[]>(INITIAL_COLUMNS);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("invoice-table-columns");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // Đưa việc setState ra khỏi luồng đồng bộ bằng setTimeout
        const timer = setTimeout(() => {
          setColumnsConfig(parsedConfig);
        }, 0);
        
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Invalid column config in local storage");
      }
    }
  }, []);

  // ── Data ──
  const { data: serials, isLoading: isSerialsLoading } = useInvoiceSerials();
  useEffect(() => {
    if (serials && serials.length > 0 && !series) {
      // Đưa việc setState ra khỏi luồng đồng bộ bằng setTimeout
      const timer = setTimeout(() => {
        setSeries(serials[0].value);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [serials, series]);

  const { data, isLoading, isFetching, refetch } = useInvoices(
    { page, limit, series },
    !!series,
  );

  const allInvoices = data?.invoices ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalRecords = data?.pagination?.total ?? 0;

  // ── Handlers for Column Settings ──
  const handleOpenColumnDialog = () => {
    setDraftColumns([...columnsConfig]);
    setIsColumnDialogOpen(true);
  };

  const handleSaveColumns = () => {
    setColumnsConfig(draftColumns);
    localStorage.setItem("invoice-table-columns", JSON.stringify(draftColumns));
    setIsColumnDialogOpen(false);
  };

  const handleResetColumns = () => {
    setDraftColumns([...INITIAL_COLUMNS]);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newCols = [...draftColumns];
    const draggedItem = newCols[draggedIdx];
    newCols.splice(draggedIdx, 1);
    newCols.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setDraftColumns(newCols);
  };

  // Render content based on column id
  const renderCellContent = (invoice: Invoice, colId: string) => {
    switch(colId) {
      case 'status': return <Badge variant="outline" className="whitespace-nowrap">{invoice.status || "N/A"}</Badge>;
      case 'taxSubmissionStatus': return <Badge variant={invoice.taxSubmissionStatus === "Thành công" ? "default" : "secondary"} className="whitespace-nowrap">{invoice.taxSubmissionStatus || "N/A"}</Badge>;
      case 'idSign': return <span className="text-muted-foreground">{invoice.idSign || ""}</span>;
      case 'invoiceSeries': return <span className="font-medium">{invoice.invoiceSeries}</span>;
      case 'invoiceIssuedDate': return invoice.invoiceIssuedDate ? formatDate(invoice.invoiceIssuedDate) : "";
      case 'invoiceNumber': return <span className="font-bold text-primary">{invoice.invoiceNumber}</span>;
      case 'buyerTaxCode': return invoice.buyerTaxCode;
      case 'buyerName': return invoice.buyerDisplayName || invoice.buyerLegalName;
      case 'totalAmount': return <span className="font-semibold tabular-nums">{formatCurrency(invoice.totalAmount)}</span>;
      case 'buyerEmail': return <span className="text-muted-foreground">{invoice.buyerEmail}</span>;
      case 'buyerCitizenId': return invoice.buyerCitizenId;
      case 'lookupCode': return <span className="font-mono text-xs">{invoice.lookupCode}</span>;
      case 'paymentMethodName': return invoice.paymentMethodName;
      case 'orderNumber': return invoice.orderNumber || "";
      // Bổ sung
      case 'creator': return "N/A"; 
      case 'totalAmountWithoutVat': return formatCurrency(invoice.totalAmountWithoutVat || 0);
      case 'vatAmount': return formatCurrency(invoice.vatAmount || 0);
      case 'sellerAddress': return "N/A"; 
      case 'currency': return "VND"; 
      case 'exchangeRate': return invoice.exchangeRate || "";
      case 'buyerLegalName': return invoice.buyerLegalName;
      case 'buyerAddressLine': return invoice.buyerAddressLine;
      case 'storeName': return "N/A";
      case 'storeAddress': return invoice.storeAddress;
      case 'storeId': return "N/A";
      case 'buyerBudgetRelationCode': return invoice.buyerBudgetRelationCode;
      case 'buyerPassport': return invoice.buyerPassport;
      case 'totalAmountInWords': return "N/A"; 
      default: return "";
    }
  };

  const visibleColumns = columnsConfig.filter(c => c.isVisible);

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

      {/* ── Filter & Actions bar ── */}
      <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
        <Select
          value={series}
          onValueChange={(v) => {
            setSeries(v);
            setPage(1);
          }}
          disabled={isSerialsLoading || !serials?.length}
        >
          <SelectTrigger className="w-full xl:w-[400px]">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
            Tải lại
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Tải Excel
          </Button>
          <Button onClick={handleOpenColumnDialog} variant="outline">
            <Settings2 className="h-4 w-4 mr-2" />
            Cột hiển thị
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo hoá đơn mới
          </Button>
        </div>
      </div>

      {/* ── Table card ── */}
      <Card>
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
                {visibleColumns.map((col) => (
                  <TableHead 
                    key={col.id} 
                    className={cn(col.align === 'right' && 'text-right')}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                  >
                    <div className="truncate" title={col.label}>{col.label}</div>
                  </TableHead>
                ))}
                {/* Cột thao tác */}
                <TableHead className="text-right sticky right-0 bg-white shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)] z-10 w-[100px] min-w-[100px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!isLoading && allInvoices.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={visibleColumns.length + 1}
                    className="h-12 text-center text-muted-foreground"
                  >
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                allInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group">
                    {visibleColumns.map((col) => (
                      <TableCell 
                        key={col.id} 
                        className={cn(col.align === 'right' && 'text-right')}
                        style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                      >
                        <div className="truncate" title={String(renderCellContent(invoice, col.id) || "")}>
                          {renderCellContent(invoice, col.id)}
                        </div>
                      </TableCell>
                    ))}
                    
                    {/* Cột thao tác (Sticky Right) */}
                    <TableCell className="text-right sticky right-0 bg-white group-hover:bg-muted/50 transition-colors shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.1)] z-10">
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
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Hiển thị</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      setLimit(Number(v));
                      setPage(1);
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

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page === 1} title="Trang đầu">
                  <ChevronLeft className="h-3.5 w-3.5 -mr-1" />
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="Trang trước">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs font-medium" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Trang sau">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Trang cuối">
                  <ChevronRight className="h-3.5 w-3.5 -mr-1" />
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ── Dialog Cài đặt cột ── */}
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Cài đặt cột hiển thị</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Kéo thả để sắp xếp, tích chọn để hiển thị và thiết lập độ rộng cột.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 pr-1">
            <div className="space-y-2">
              {draftColumns.map((col, idx) => (
                <div
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={cn(
                    "flex items-center gap-3 p-2 bg-background border rounded-md cursor-move transition-colors",
                    draggedIdx === idx && "opacity-50 border-primary"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  <input
                    type="checkbox"
                    checked={col.isVisible}
                    onChange={(e) => {
                      const newDraft = [...draftColumns];
                      newDraft[idx].isVisible = e.target.checked;
                      setDraftColumns(newDraft);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                  />
                  <span className="text-sm font-medium flex-1 truncate select-none" title={col.label}>
                    {col.label}
                  </span>
                  
                  {/* Nhập số lượng px độ rộng */}
                  <div className="flex items-center gap-1 w-20 shrink-0">
                    <Input
                      type="number"
                      value={col.width || 100}
                      onChange={(e) => {
                        const newDraft = [...draftColumns];
                        newDraft[idx].width = Number(e.target.value);
                        setDraftColumns(newDraft);
                      }}
                      className="h-8 px-2 text-xs text-center"
                      title="Kích thước cột (px)"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
            <Button variant="ghost" onClick={handleResetColumns}>
              Đặt lại
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                Huỷ
              </Button>
              <Button onClick={handleSaveColumns}>
                Lưu cài đặt
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}