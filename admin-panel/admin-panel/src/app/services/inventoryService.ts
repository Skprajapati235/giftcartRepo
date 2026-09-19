import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("giftcartAdminToken") || "";
};

const authApi = () =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

export interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: { _id: string; name: string } | null;
  image: string;
  price: number;
  salePrice: number;
  discount: number;
  tax: number;
  shippingCost: number;
  stock: number;
  lowStockThreshold: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockStatusLabel: string;
  totalValuation: number;
  totalValuationMRP: number;
  flowerCount?: string;
  weight?: string;
  flowerCountOptions?: Array<{
    _id: string;
    flowerCount: string;
    price: number;
    salePrice?: number;
    stock?: number;
    sku?: string;
  }>;
  weightOptions?: Array<{
    _id: string;
    weight: string;
    price: number;
    salePrice?: number;
    stock?: number;
    sku?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  totalValueSelling: number;
  totalValueMRP: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoriesCount: number;
  categoryBreakdown: Array<{
    name: string;
    productCount: number;
    totalStock: number;
    totalValue: number;
  }>;
  lowStockAlerts: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    status: string;
  }>;
}

export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  category?: string;
  sortBy?: "stock" | "name" | "price" | "valuation" | "createdAt" | "category";
  sortOrder?: "asc" | "desc";
}

export const getInventorySummary = async (): Promise<InventorySummary> => {
  const response = await authApi().get("/inventory/summary");
  return response.data.data;
};

export const getInventoryItems = async (params?: InventoryQueryParams) => {
  const response = await authApi().get("/inventory", { params });
  return response.data;
};

export const updateProductStock = async (
  id: string,
  payload: {
    stock?: number;
    operation?: "set" | "add" | "subtract";
    lowStockThreshold?: number;
    sku?: string;
    variantType?: "flowerCountOptions" | "weightOptions";
    variantId?: string;
  }
) => {
  const response = await authApi().put(`/inventory/${id}/stock`, payload);
  return response.data;
};

export const bulkUpdateProductStock = async (
  updates: Array<{
    id: string;
    stock?: number;
    operation?: "set" | "add" | "subtract";
    lowStockThreshold?: number;
    sku?: string;
  }>
) => {
  const response = await authApi().post("/inventory/bulk-stock", { updates });
  return response.data;
};

/**
 * Trigger download of Excel (CSV) file
 */
export const downloadInventoryExcel = async (params?: InventoryQueryParams) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.category && params.category !== "all") query.append("category", params.category);

  const url = `${baseURL}/inventory/export/excel?${query.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export Excel report");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `giftfestive-inventory-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Trigger download of PDF report
 */
export const downloadInventoryPdf = async (params?: InventoryQueryParams) => {
  const token = getAuthToken();
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.category && params.category !== "all") query.append("category", params.category);

  const url = `${baseURL}/inventory/export/pdf?${query.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export PDF report");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `giftfestive-inventory-${dateStr}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
