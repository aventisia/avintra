import { useNavigate, useLocation } from "react-router-dom";

/**
 * Custom hook to navigate to a new path while preserving query parameters
 */
export const useNavigatePreserveQuery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a new path while preserving all existing query parameters
   * @param newPath - The new path to navigate to
   */
  const navigateWithQueryParams = (newPath: string) => {
    // Get the current search string (query parameters)
    const currentQueryParams = location.search;

    // Navigate to the new path with the current query parameters
    navigate(`${newPath}${currentQueryParams}`);
  };

  return navigateWithQueryParams;
};
