import { FormFieldSizeType } from "@aventisia/ui/types";
import type { ReactNode } from "react";

/**
 * Shared configuration for async select component variants.
 */
export interface AsyncSelectBaseProps<TItem, TFilters = undefined> {
  placeholder?: string;
  className?: string;
  maxHeightClassName?: string;
  queryKeyBase: string | readonly unknown[];
  fetcher: (query: string, filters: TFilters) => Promise<TItem[]>;
  filters: TFilters;
  getItemId: (item: TItem) => string;
  getItemLabel: (item: TItem) => string;
  renderItem?: (item: TItem) => ReactNode;
  debounceMs?: number;
  minChars?: number;
  enabled?: boolean;
  disabled?: boolean;
  size?: FormFieldSizeType;
  loadingText?: string;
  errorText?: string;
  startTypingText?: string;
  noResultsText?: string;
}

/**
 * Props for the async single-select component.
 */
export interface AsyncSingleSelectProps<TItem, TFilters = undefined>
  extends AsyncSelectBaseProps<TItem, TFilters> {
  selectedItem?: TItem | null;
  onSelect: (item: TItem | null) => void;
}

/**
 * Props for the async multi-select component.
 */
export interface AsyncMultiSelectProps<TItem, TFilters = undefined>
  extends AsyncSelectBaseProps<TItem, TFilters> {
  selectedItems?: TItem[];
  onSelectMultiple: (items: TItem[]) => void;
}

/**
 * Parameters for the debounced async search hook.
 */
export interface UseDebouncedSearchParams<TData, TFilters = undefined> {
  queryKeyBase: string | readonly unknown[];
  fetcher: (query: string, filters: TFilters) => Promise<TData>;
  filters: TFilters;
  debounceMs?: number;
  minChars?: number;
  enabled?: boolean;
  initialSearchTerm?: string;
}

/**
 * Return shape for the debounced async search hook.
 */
export interface UseDebouncedSearchReturn<TData> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
