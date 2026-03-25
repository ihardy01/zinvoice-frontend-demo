"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { invoiceSchema, InvoiceFormValues } from "@/lib/validators";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/use-invoice";
import { Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/index";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã huỷ" },
  { value: "OVERDUE", label: "Quá hạn" },
];

export function InvoiceForm({ invoice, onSuccess }: InvoiceFormProps) {
  const isEdit = !!invoice;
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();
  const { mutate: updateInvoice, isPending: isUpdating } = useUpdateInvoice();
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      amount: 0,
      status: "PENDING",
      issueDate: "",
      dueDate: "",
      description: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (invoice) {
      reset({
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        amount: invoice.amount,
        status: invoice.status,
        issueDate: invoice.issueDate.split("T")[0],
        dueDate: invoice.dueDate.split("T")[0],
        description: invoice.description || "",
      });
    }
  }, [invoice, reset]);

  const onSubmit = (data: InvoiceFormValues) => {
    if (isEdit && invoice) {
      updateInvoice({ ...data, id: invoice.id }, { onSuccess });
    } else {
      createInvoice(data, { onSuccess });
    }
  };

  const currentStatus = watch("status");

  return (
    <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Chỉnh sửa hoá đơn" : "Tạo hoá đơn mới"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Cập nhật thông tin hoá đơn bên dưới."
            : "Điền đầy đủ thông tin để tạo hoá đơn mới."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customerName">
            Tên khách hàng <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerName"
            placeholder="Nguyễn Văn A"
            {...register("customerName")}
            className={errors.customerName ? "border-destructive" : ""}
          />
          {errors.customerName && (
            <p className="text-xs text-destructive">
              {errors.customerName.message}
            </p>
          )}
        </div>

        {/* Customer Email */}
        <div className="space-y-2">
          <Label htmlFor="customerEmail">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="example@email.com"
            {...register("customerEmail")}
            className={errors.customerEmail ? "border-destructive" : ""}
          />
          {errors.customerEmail && (
            <p className="text-xs text-destructive">
              {errors.customerEmail.message}
            </p>
          )}
        </div>

        {/* Amount + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền (VNĐ) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Trạng thái <span className="text-destructive">*</span>
            </Label>
            <Select
              value={currentStatus}
              onValueChange={(val) =>
                setValue("status", val as InvoiceFormValues["status"])
              }
            >
              <SelectTrigger
                className={errors.status ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issueDate">
              Ngày phát hành <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issueDate"
              type="date"
              {...register("issueDate")}
              className={errors.issueDate ? "border-destructive" : ""}
            />
            {errors.issueDate && (
              <p className="text-xs text-destructive">
                {errors.issueDate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Ngày đến hạn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              className={errors.dueDate ? "border-destructive" : ""}
            />
            {errors.dueDate && (
              <p className="text-xs text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Ghi chú</Label>
          <Textarea
            id="description"
            placeholder="Mô tả hoá đơn (tuỳ chọn)"
            rows={3}
            {...register("description")}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? isEdit
                ? "Đang cập nhật..."
                : "Đang tạo..."
              : isEdit
                ? "Cập nhật"
                : "Tạo hoá đơn"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
