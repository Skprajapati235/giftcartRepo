"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as service from "../services/adminService";

interface AdminContextState {
  products: any[];
  categories: any[];
  users: any[];
  admins: any[];
  cities: any[];
  loading: boolean;
  error: string;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  refreshAll: () => Promise<void>;
  createCategory: (payload: { name: string; image?: string }) => Promise<void>;
  updateCategory: (id: string, payload: { name: string; image?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createCity: (payload: { state: string; cities: string[]; image?: string }) => Promise<void>;
  updateCity: (id: string, payload: { state: string; cities: string[]; image?: string }) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  createProduct: (payload: {
    name: string;
    price: number;
    salePrice?: number;
    description: string;
    summary?: string;
    layout?: string;
    image: string;
    category: string;
    weight?: string;
    flowers?: number;
    isCodAvailable?: boolean;
  }) => Promise<void>;
  updateProduct: (
    id: string,
    payload: {
      name: string;
      price: number;
      salePrice?: number;
      description: string;
      summary?: string;
      layout?: string;
      image: string;
      category: string;
      weight?: string;
      flowers?: number;
      isCodAvailable?: boolean;
    }
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateAdmin: (id: string, payload: { name?: string; email?: string; city?: string }) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextState | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  const fetchAll = async () => {
    if (!authenticated) {
      setProducts([]);
      setCategories([]);
      setUsers([]);
      setAdmins([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [productData, categoryData, cityData, userData, adminData] = await Promise.all([
        service.getProducts({ limit: 1000 }), // Get large batch for context
        service.getCategories({ limit: 1000 }),
        service.getCities({ limit: 1000 }),
        service.getUsers({ limit: 1000 }),
        service.getAdmins({ limit: 1000 }),
      ]);

      const pArr = productData.data || productData || [];
      const cArr = categoryData.data || categoryData || [];
      const cityArr = cityData.data || cityData || [];
      const uArr = userData.data || userData || [];
      const aArr = adminData.data || adminData || [];

      setProducts([...pArr].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCategories([...cArr].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCities([...cityArr].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUsers(uArr);
      setAdmins(aArr);

      setTotalProducts(productData.total || pArr.length);
      setTotalCategories(categoryData.total || cArr.length);
      setTotalUsers(userData.total || uArr.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchAll();
  }, [authenticated, authLoading]);

  const refreshAll = async () => {
    await fetchAll();
  };

  const handleCreateCategory = async (payload: { name: string, image?: string }) => {
    await service.createCategory(payload);
    await refreshAll();
  };

  const handleUpdateCategory = async (id: string, payload: { name: string, image?: string }) => {
    await service.updateCategory(id, payload);
    await refreshAll();
  };

  const handleDeleteCategory = async (id: string) => {
    await service.deleteCategory(id);
    await refreshAll();
  };

  const handleCreateProduct = async (payload: {
    name: string;
    price: number;
    salePrice?: number;
    description: string;
    summary?: string;
    layout?: string;
    image: string;
    category: string;
    weight?: string;
    flowers?: number;
    isCodAvailable?: boolean;
  }) => {
    await service.createProduct(payload);
    await refreshAll();
  };

  const handleUpdateProduct = async (
    id: string,
    payload: {
      name: string;
      price: number;
      salePrice?: number;
      description: string;
      summary?: string;
      layout?: string;
      image: string;
      category: string;
      weight?: string;
      flowers?: number;
      isCodAvailable?: boolean;
    }
  ) => {
    await service.updateProduct(id, payload);
    await refreshAll();
  };

  const handleDeleteProduct = async (id: string) => {
    await service.deleteProduct(id);
    await refreshAll();
  };

  const handleCreateCity = async (payload: { state: string; cities: string[]; image?: string }) => {
    await service.createCity(payload);
    await refreshAll();
  };

  const handleUpdateCity = async (id: string, payload: { state: string; cities: string[]; image?: string }) => {
    await service.updateCity(id, payload);
    await refreshAll();
  };

  const handleDeleteCity = async (id: string) => {
    await service.deleteCity(id);
    await refreshAll();
  };

  const handleDeleteUser = async (id: string) => {
    await service.deleteUser(id);
    await refreshAll();
  };

  const handleUpdateAdmin = async (
    id: string,
    payload: { name?: string; email?: string; city?: string }
  ) => {
    await service.updateAdmin(id, payload);
    await refreshAll();
  };

  const handleDeleteAdmin = async (id: string) => {
    await service.deleteAdmin(id);
    await refreshAll();
  };


  const value = useMemo(
    () => ({
      products,
      categories,
      cities,
      users,
      admins,
      loading,
      error,
      totalProducts,
      totalUsers,
      totalCategories,
      refreshAll,
      createCategory: handleCreateCategory,
      updateCategory: handleUpdateCategory,
      deleteCategory: handleDeleteCategory,
      createProduct: handleCreateProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      createCity: handleCreateCity,
      updateCity: handleUpdateCity,
      deleteCity: handleDeleteCity,
      deleteUser: handleDeleteUser,
      updateAdmin: handleUpdateAdmin,
      deleteAdmin: handleDeleteAdmin,
    }),
    [products, categories, cities, users, admins, loading, error, totalProducts, totalUsers, totalCategories]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
}
