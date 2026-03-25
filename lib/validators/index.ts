import { z } from "zod";

// -----------------------------------------------
// Auth Validators
// -----------------------------------------------
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Tên đăng nhập không được để trống")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// -----------------------------------------------
// Invoice Validators
// -----------------------------------------------
export const invoiceSchema = z.object({
  customerName: z
    .string()
    .min(1, "Tên khách hàng không được để trống")
    .max(100, "Tên không được vượt quá 100 ký tự"),
  customerEmail: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  amount: z
    .number({
      required_error: "Số tiền không được để trống",
      invalid_type_error: "Số tiền phải là số",
    })
    .positive("Số tiền phải lớn hơn 0"),
  status: z.enum(["PENDING", "PAID", "CANCELLED", "OVERDUE"], {
    required_error: "Vui lòng chọn trạng thái",
  }),
  issueDate: z.string().min(1, "Ngày phát hành không được để trống"),
  dueDate: z.string().min(1, "Ngày đến hạn không được để trống"),
  description: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
