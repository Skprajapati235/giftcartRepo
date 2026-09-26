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
  flavors: any[];
  occasions: any[];
  loading: boolean;
  error: string;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  refreshAll: () => Promise<void>;
  createCategory: (payload: { name: string; image?: string }) => Promise<void>;
  updateCategory: (id: string, payload: { name: string; image?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createFlavor: (payload: { name: string; image?: string }) => Promise<void>;
  updateFlavor: (id: string, payload: { name: string; image?: string }) => Promise<void>;
  deleteFlavor: (id: string) => Promise<void>;
  createOccasion: (payload: { name: string; image?: string; isActive?: boolean }) => Promise<void>;
  updateOccasion: (id: string, payload: { name?: string; image?: string; isActive?: boolean }) => Promise<void>;
  deleteOccasion: (id: string) => Promise<void>;
  heroSlides: any[];
  createHeroSlide: (payload: any) => Promise<void>;
  updateHeroSlide: (id: string, payload: any) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  createCity: (payload: { state: string; cities: string[]; image?: string }) => Promise<void>;
  updateCity: (id: string, payload: { state: string; cities: string[]; image?: string }) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
  createProduct: (payload: any) => Promise<void>;
  updateProduct: (id: string, payload: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateAdmin: (id: string, payload: any) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextState | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [flavors, setFlavors] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  const fetchAll = React.useCallback(async () => {
    if (!authenticated) {
      setProducts([]);
      setCategories([]);
      setHeroSlides([]);
      setUsers([]);
      setAdmins([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [productData, categoryData, cityData, userData, adminData, flavorData, occasionData, heroSlideData] = await Promise.all([
        service.getProducts({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getCategories({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getCities({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getUsers({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getAdmins({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getFlavors({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getOccasions({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
        service.getHeroSlides({ limit: 1000 }).catch(e => ({ data: [], total: 0 })),
      ]);

      const pArr = productData?.data || (Array.isArray(productData) ? productData : []);
      const cArr = categoryData?.data || (Array.isArray(categoryData) ? categoryData : []);
      const cityArr = cityData?.data || (Array.isArray(cityData) ? cityData : []);
      const uArr = userData?.data || (Array.isArray(userData) ? userData : []);
      const aArr = adminData?.data || (Array.isArray(adminData) ? adminData : []);
      const fArr = flavorData?.data || (Array.isArray(flavorData) ? flavorData : []);
      const ocArr = occasionData?.data || (Array.isArray(occasionData) ? occasionData : []);
      const hsArr = heroSlideData?.data || (Array.isArray(heroSlideData) ? heroSlideData : []);

      setProducts([...pArr].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setCategories([...cArr].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setCities([...cityArr].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setFlavors([...fArr].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setOccasions([...ocArr].sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setHeroSlides([...hsArr].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
      setUsers(uArr);
      setAdmins(aArr);

      setTotalProducts(productData?.total || pArr.length);
      setTotalCategories(categoryData?.total || cArr.length);
      setTotalUsers(userData?.total || uArr.length);
    } catch (err) {
      console.error("FetchAll Error:", err);
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authLoading) return;
    fetchAll();
  }, [authenticated, authLoading, fetchAll]);

  const refreshAll = React.useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

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

  const handleCreateFlavor = async (payload: { name: string, image?: string }) => {
    await service.createFlavor(payload);
    await refreshAll();
  };

  const handleUpdateFlavor = async (id: string, payload: { name: string, image?: string }) => {
    await service.updateFlavor(id, payload);
    await refreshAll();
  };

  const handleFlavorDelete = async (id: string) => {
    await service.deleteFlavor(id);
    await refreshAll();
  };

  const handleCreateOccasion = async (payload: { name: string, image?: string, isActive?: boolean }) => {
    await service.createOccasion(payload);
    await refreshAll();
  };

  const handleUpdateOccasion = async (id: string, payload: { name?: string, image?: string, isActive?: boolean }) => {
    await service.updateOccasion(id, payload);
    await refreshAll();
  };

  const handleOccasionDelete = async (id: string) => {
    await service.deleteOccasion(id);
    await refreshAll();
  };

  const handleCreateHeroSlide = async (payload: any) => {
    await service.createHeroSlide(payload);
    await refreshAll();
  };

  const handleUpdateHeroSlide = async (id: string, payload: any) => {
    await service.updateHeroSlide(id, payload);
    await refreshAll();
  };

  const handleHeroSlideDelete = async (id: string) => {
    await service.deleteHeroSlide(id);
    await refreshAll();
  };

  const handleCreateProduct = async (payload: any) => {
    await service.createProduct(payload);
    await refreshAll();
  };

  const handleUpdateProduct = async (id: string, payload: any) => {
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

  const handleUpdateAdmin = async (id: string, payload: any) => {
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
      flavors,
      occasions,
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
      createFlavor: handleCreateFlavor,
      updateFlavor: handleUpdateFlavor,
      deleteFlavor: handleFlavorDelete,
      createOccasion: handleCreateOccasion,
      updateOccasion: handleUpdateOccasion,
      deleteOccasion: handleOccasionDelete,
      heroSlides,
      createHeroSlide: handleCreateHeroSlide,
      updateHeroSlide: handleUpdateHeroSlide,
      deleteHeroSlide: handleHeroSlideDelete,
    }),
    [products, categories, cities, flavors, occasions, heroSlides, users, admins, loading, error, totalProducts, totalUsers, totalCategories]
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
