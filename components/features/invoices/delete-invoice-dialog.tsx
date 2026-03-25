"use client";

import { Loader2 } from "lucide-react";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteInvoiceDialog({
  invoice,
  isOpen,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteInvoiceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Xác nhận xoá hoá đơn</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xoá hoá đơn{" "}
            <span className="font-semibold text-foreground">
              {invoice?.invoiceNumber}
            </span>{" "}
            của khách hàng{" "}
            <span className="font-semibold text-foreground">
              {invoice?.customerName}
            </span>
            ? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Đang xoá..." : "Xoá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
