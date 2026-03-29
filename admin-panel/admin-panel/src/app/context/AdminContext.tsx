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
  loading: boolean;
  error: string;
  refreshAll: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createProduct: (payload: {
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
  }) => Promise<void>;
  updateProduct: (
    id: string,
    payload: {
      name: string;
      price: number;
      description: string;
      image: string;
      category: string;
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
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const [productData, categoryData, userData, adminData] = await Promise.all([
        service.getProducts(),
        service.getCategories(),
        service.getUsers(),
        service.getAdmins(),
      ]);

      setProducts(productData || []);
      setCategories(categoryData || []);
      setUsers(userData || []);
      setAdmins(adminData || []);
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

  const handleCreateCategory = async (name: string) => {
    if (!name.trim()) return;
    await service.createCategory({ name: name.trim() });
    await refreshAll();
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    await service.updateCategory(id, { name: name.trim() });
    await refreshAll();
  };

  const handleDeleteCategory = async (id: string) => {
    await service.deleteCategory(id);
    await refreshAll();
  };

  const handleCreateProduct = async (payload: {
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
  }) => {
    await service.createProduct(payload);
    await refreshAll();
  };

  const handleUpdateProduct = async (
    id: string,
    payload: {
      name: string;
      price: number;
      description: string;
      image: string;
      category: string;
    }
  ) => {
    await service.updateProduct(id, payload);
    await refreshAll();
  };

  const handleDeleteProduct = async (id: string) => {
    await service.deleteProduct(id);
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
      users,
      admins,
      loading,
      error,
      refreshAll,
      createCategory: handleCreateCategory,
      updateCategory: handleUpdateCategory,
      deleteCategory: handleDeleteCategory,
      createProduct: handleCreateProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct,
      deleteUser: handleDeleteUser,
      updateAdmin: handleUpdateAdmin,
      deleteAdmin: handleDeleteAdmin,
    }),
    [products, categories, users, admins, loading, error]
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
