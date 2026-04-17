"use client";

import { useState, useCallback } from "react";

export interface TableParams {
  page: number;
  limit: number;
  search: string;
  category: string;
}

export const useTableParams = (defaultLimit = 10) => {
  const [params, setParams] = useState<TableParams>({
    page: 1,
    limit: defaultLimit,
    search: "",
    category: "",
  });

  const updateParams = useCallback((newParams: Partial<TableParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

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
