import type { Metadata } from "next";
import { InvoicePageClient } from "@/components/features/invoices/invoice-page-client";

export const metadata: Metadata = {
  title: "Hoá đơn | Dashboard",
  description:
    "Quản lý toàn bộ hoá đơn: tạo mới, chỉnh sửa, xoá và theo dõi trạng thái.",
};

export default function InvoicesPage() {
  return <InvoicePageClient />;
}
