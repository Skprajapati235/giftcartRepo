"use client";

import { useState, useEffect, useCallback } from "react";
import { useTableParams } from "./useTableParams";

interface ResourceResponse<T> {
  [key: string]: any;
  total: number;
  page: number;
  totalPages: number;
}

export function useResource<T>(
  fetchFn: (params: any) => Promise<any>,
  resourceKey: string,
  defaultLimit = 10
) {
  const { 
    params, 
    onPageChange, 
    onLimitChange, 
    onSearchChange, 
    onCategoryChange,
    setParams 
  } = useTableParams(defaultLimit);

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Lazy search debouncing
  const [debouncedSearch, setDebouncedSearch] = useState(params.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(params.search);
    }, 600);
    return () => clearTimeout(timer);
  }, [params.search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Use debounced search for the actual API call
      const fetchParams = { 
        ...params, 
        search: debouncedSearch,
        category: params.category // Ensure category is explicitly passed
      };
      
      console.log(`[useResource] Fetching ${resourceKey}:`, fetchParams);
      const response = await fetchFn(fetchParams);
      
      if (Array.isArray(response)) {
        setData(response);
        setTotal(response.length);
        setTotalPages(1);
      } else if (response) {
        setData(response.data || response[resourceKey] || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        setData([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, debouncedSearch, params.page, params.limit, params.category, resourceKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    params,
    onPageChange,
    onLimitChange,
    onSearchChange,
    onCategoryChange,
    refresh: fetchData,
    setParams
  };
}
