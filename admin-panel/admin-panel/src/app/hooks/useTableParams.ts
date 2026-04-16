"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface TableParams {
  page: number;
  limit: number;
  search: string;
  category: string;
}

export const useTableParams = (defaultLimit = 10) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [params, setParams] = useState<TableParams>({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || defaultLimit.toString()),
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
  });

  // Sync URL changes back to local state (handles back/forward buttons)
  useEffect(() => {
    setParams({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || defaultLimit.toString()),
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
    });
  }, [searchParams, defaultLimit]);

  const updateParams = useCallback((newParams: Partial<TableParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Sync state to URL with a slight debounce for search to avoid router spam
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      if (params.page > 1) sp.set("page", params.page.toString());
      if (params.limit !== defaultLimit) sp.set("limit", params.limit.toString());
      if (params.search) sp.set("search", params.search);
      if (params.category) sp.set("category", params.category);
      
      const newUrl = `${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`;
      router.push(newUrl);
    }, 400); // Debounce URL update

    return () => clearTimeout(timer);
  }, [params.page, params.limit, params.search, params.category, pathname, router, defaultLimit]);

  const onPageChange = (page: number) => updateParams({ page });
  const onLimitChange = (limit: number) => updateParams({ limit, page: 1 });
  const onSearchChange = (search: string) => updateParams({ search, page: 1 });
  const onCategoryChange = (category: string) => updateParams({ category, page: 1 });

  return {
    params,
    onPageChange,
    onLimitChange,
    onSearchChange,
    onCategoryChange,
    setParams
  };
};
