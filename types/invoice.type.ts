export interface ItemInvoice {
  property: number;
  itemCode: string;
  itemName: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  itemDiscountAmount: number;
  amount: number;
  itemTotalAmountWithoutVat: number;
  vatRateDeduction: number;
  vatAmountDeduction: number;
  vatRate: number;
  itemVatAmount: number;
  itemTotalAmount: number;
}

export interface Invoice {
  id: string;
  created_at: string;
  idSign: string;
  status: string;
  taxSubmissionStatus: string;
  invoiceNumber: string;
  lookupCode: string;
  invoiceSeries: string;
  invoiceIssuedDate: string;
  exchangeRate: string;
  paymentMethodName: string;
  buyerDisplayName: string;
  buyerLegalName: string;
  buyerTaxCode: string;
  buyerAddressLine: string;
  buyerEmail: string;
  buyerBankAccount: string;
  buyerCitizenId: string;
  buyerPassport: string;
  discountAmount: number;
  totalAmountWithoutVat: number;
  vatAmount: number;
  totalAmount: number;
  nonTaxZone: number;
  isDeductionNQ43: boolean;
  buyerBudgetRelationCode: string;
  vatRateOnRevenueNQ101: string;
  vatReductionAmountNQ101: number;
  buyerCode: string;
  buyerTel: string;
  storeAddress: string;
  orderNumber?: string;
  items: ItemInvoice[];
}

export interface InvoiceSerial {
  id: string;
  symbolManagement68Id: string;
  invoiceSymbol: string;
  value: string;
  invoiceForm: string;
  invoiceYear: number;
  invoiceTypeName: string;
}

export interface PaginationInvoiceParams {
  page: number;
  limit: number;
  series?: string;
}