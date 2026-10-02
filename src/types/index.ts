export type DosageForm =
  | "TABLET"
  | "CAPSULE"
  | "SYRUP"
  | "INJECTION"
  | "OINTMENT"
  | "DROPS"
  | "SUSPENSION"
  | "INHALER"
  | "CREAM"
  | "GEL"
  | "POWDER"
  | "OTHER";

export type BatchStatus = "ACTIVE" | "QUARANTINED" | "EXPIRED" | "DEPLETED";
export type CustomerType = "RETAIL" | "WHOLESALE" | "HOSPITAL" | "DOCTOR";
export type SaleType = "RETAIL" | "WHOLESALE";
export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
export type PaymentMethod =
  "CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "CREDIT" | "SPLIT";
export type AdjustmentType =
  | "DAMAGE"
  | "EXPIRED_WRITE_OFF"
  | "INVENTORY_AUDIT"
  | "RETURN_TO_SUPPLIER"
  | "CORRECTION";

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  purchasePrice: number;
  mrp: number;
  retailPrice: number;
  wholesalePrice: number;
  quantity: number;
  initialQuantity: number;
  packSize: number;
  barcode?: string | null;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
  daysUntilExpiry?: number;
  medicine?: Medicine;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  sku: string;
  barcode?: string | null;
  category: string;
  dosageForm: DosageForm;
  strength?: string | null;
  manufacturer: string;
  hsnCode?: string | null;
  gstRate: number;
  minStockAlert: number;
  maxStockAlert?: number | null;
  rackLocation?: string | null;
  prescriptionRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  batches?: Batch[];
  totalStock?: number;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
  dlNumber?: string | null;
  creditLimit?: number | null;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone: string;
  email?: string | null;
  gstin?: string | null;
  dlNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  creditPeriodDays: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization?: string | null;
  hospital?: string | null;
  regNumber?: string | null;
  phone?: string | null;
}

export interface SaleItem {
  id: string;
  saleId: string;
  medicineId: string;
  batchId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  gstRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  billNumber: string;
  type: SaleType;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  prescriptionNumber?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
  customer?: Customer;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  medicineId: string;
  batchId?: string | null;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  freeQuantity: number;
  unitCost: number;
  mrp: number;
  gstRate: number;
  discount: number;
  totalCost: number;
  medicine?: Medicine;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  purchaseDate: string;
  dueDate?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  createdAt: string;
  supplier?: Supplier;
  items: PurchaseItem[];
}

export interface StoreSettings {
  id: string;
  pharmacyName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  dlNumber: string;
  currency: string;
  thermalPrint: boolean;
  invoiceFooter: string;
}

export interface DashboardMetrics {
  todaySales: number;
  todayInvoicesCount: number;
  monthSales: number;
  totalStockValue: number;
  lowStockCount: number;
  nearExpiryCount: number;
  expiredStockCount: number;
  totalCustomersCount: number;
  totalSuppliersCount: number;
}

export interface SalesTrendItem {
  date: string;
  sales: number;
  profit: number;
  count: number;
}

export interface TopMedicine {
  medicineName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface CartItem {
  medicine: Medicine;
  selectedBatch: Batch;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  maxAvailable: number;
}
