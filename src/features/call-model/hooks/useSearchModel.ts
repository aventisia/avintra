import { useDebounce } from "@/features/share-access/hooks/useDebounce";
import { useState } from "react";
import { useFetchModelsList } from "./useFetchModelsList";

// Custom hook to manage searching agents with debounced input
export const useSearchModel = () => {
  // State to hold the user's search input
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced version of the search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch agent list based on the debounced search term
  const {
    data: searchData,
    isLoading,
    isError,
  } = useFetchModelsList(debouncedSearchTerm);

  // Expose necessary states and actions to the component using this hook
  return {
    searchTerm,
    setSearchTerm,
    searchData,
    isLoading,
    isError,
  };
};
