import { useDebounce } from "@/features/share-access/hooks/useDebounce";
import { useState } from "react";
import { useFetchBlocksList } from "./useFetchBlocksList";

// Custom hook to manage searching blocks with debounced input
export const useSearchBlock = () => {
  // State to hold the user's search input
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced version of the search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch block list based on the debounced search term
  const {
    data: searchData,
    isLoading,
    isError,
  } = useFetchBlocksList(debouncedSearchTerm);

  // Expose necessary states and actions to the component using this hook
  return {
    searchTerm,
    setSearchTerm,
    searchData,
    isLoading,
    isError,
  };
};
