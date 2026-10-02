import type {
  Medicine,
  Batch,
  Sale,
  Purchase,
  Customer,
  Supplier,
  Doctor,
  DashboardMetrics,
  SalesTrendItem,
  TopMedicine,
  StoreSettings,
} from "../types";

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    const message = result.error?.message || result.message || "Request failed";
    throw new Error(message);
  }

  return result.data;
}

export const api = {
  // Medicines & Inventory
  getMedicines: (params?: {
    search?: string;
    category?: string;
    dosageForm?: string;
    lowStock?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category) query.append("category", params.category);
    if (params?.dosageForm) query.append("dosageForm", params.dosageForm);
    if (params?.lowStock) query.append("lowStock", "true");
    return fetchJson<Medicine[]>(`/medicines?${query.toString()}`);
  },

  getMedicineById: (id: string) => fetchJson<Medicine>(`/medicines/${id}`),
  createMedicine: (data: Partial<Medicine>) =>
    fetchJson<Medicine>("/medicines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMedicine: (id: string, data: Partial<Medicine>) =>
    fetchJson<Medicine>(`/medicines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMedicine: (id: string) =>
    fetchJson<{ success: boolean }>(`/medicines/${id}`, { method: "DELETE" }),

  // Batches
  getBatches: (params?: {
    medicineId?: string;
    search?: string;
    nearExpiryDays?: number;
    expiredOnly?: boolean;
    activeOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.medicineId) query.append("medicineId", params.medicineId);
    if (params?.search) query.append("search", params.search);
    if (params?.nearExpiryDays)
      query.append("nearExpiryDays", String(params.nearExpiryDays));
    if (params?.expiredOnly) query.append("expiredOnly", "true");
    if (params?.activeOnly) query.append("activeOnly", "true");
    return fetchJson<Batch[]>(`/batches?${query.toString()}`);
  },

  getBatchesFEFO: (medicineId: string) =>
    fetchJson<Batch[]>(`/batches/fefo/${medicineId}`),
  createBatch: (data: Partial<Batch>) =>
    fetchJson<Batch>("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getExpiryAlerts: (days: number = 60) =>
    fetchJson<{ nearExpiry: Batch[]; expired: Batch[] }>(
      `/batches/expiry-alerts?days=${days}`,
    ),
  getLowStockAlerts: () => fetchJson<Medicine[]>("/medicines/low-stock"),

  // Stock Adjustment
  adjustStock: (data: {
    medicineId: string;
    batchId: string;
    type: string;
    quantity: number;
    reason: string;
  }) =>
    fetchJson<any>("/adjustments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAdjustments: () => fetchJson<any[]>("/adjustments"),

  // POS / Sales
  getSales: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));
    if (params?.search) query.append("search", params.search);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    return fetchJson<{ sales: Sale[]; total: number }>(
      `/sales?${query.toString()}`,
    );
  },

  getSaleById: (id: string) => fetchJson<Sale>(`/sales/${id}`),
  createSale: (data: any) =>
    fetchJson<Sale>("/sales", { method: "POST", body: JSON.stringify(data) }),
  updateSalePayment: (
    id: string,
    data: { paymentStatus: "PAID" | "PARTIAL" | "UNPAID"; paidAmount?: number },
  ) =>
    fetchJson<Sale>(`/sales/${id}/payment`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Purchases
  getPurchases: (params?: {
    limit?: number;
    offset?: number;
    supplierId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));
    if (params?.supplierId) query.append("supplierId", params.supplierId);
    return fetchJson<{ purchases: Purchase[]; total: number }>(
      `/purchases?${query.toString()}`,
    );
  },

  createPurchase: (data: any) =>
    fetchJson<Purchase>("/purchases", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Parties
  getCustomers: (search?: string, type?: string) => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    if (type) query.append("type", type);
    return fetchJson<Customer[]>(`/customers?${query.toString()}`);
  },

  createCustomer: (data: Partial<Customer>) =>
    fetchJson<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    fetchJson<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id: string) =>
    fetchJson<any>(`/customers/${id}`, { method: "DELETE" }),

  getSuppliers: (search?: string) => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    return fetchJson<Supplier[]>(`/suppliers?${query.toString()}`);
  },

  createSupplier: (data: Partial<Supplier>) =>
    fetchJson<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: string, data: Partial<Supplier>) =>
    fetchJson<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: string) =>
    fetchJson<any>(`/suppliers/${id}`, { method: "DELETE" }),

  getDoctors: (search?: string) => {
    const query = new URLSearchParams();
    if (search) query.append("search", search);
    return fetchJson<Doctor[]>(`/doctors?${query.toString()}`);
  },

  createDoctor: (data: Partial<Doctor>) =>
    fetchJson<Doctor>("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalyticsSummary: () => fetchJson<DashboardMetrics>("/analytics/summary"),
  getSalesTrend: (days: number = 7) =>
    fetchJson<SalesTrendItem[]>(`/analytics/trend?days=${days}`),
  getTopMedicines: (limit: number = 10) =>
    fetchJson<TopMedicine[]>(`/analytics/top-selling?limit=${limit}`),
  getFastSlowMoving: () =>
    fetchJson<{ fastMoving: any[]; slowMoving: any[] }>(
      "/analytics/fast-slow-moving",
    ),
  getGSTR1: (startDate?: string, endDate?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    return fetchJson<any>(`/analytics/gstr1?${query.toString()}`);
  },

  // Settings
  getSettings: () => fetchJson<StoreSettings>("/settings"),
  updateSettings: (data: Partial<StoreSettings>) =>
    fetchJson<StoreSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
