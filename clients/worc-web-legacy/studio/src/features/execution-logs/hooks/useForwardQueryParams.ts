/**
 * Hook to navigate to a new path while retaining existing query params
 */
import { useSearchParams } from "react-router-dom";

export const useCarryParams = (params: string[]) => {
  const [searchParams] = useSearchParams();

  const buildPath = (path: string) => {
    const query = new URLSearchParams();
    params.forEach((key) => {
      const value = searchParams.get(key);
      if (value) query.set(key, value);
    });
    const queryString = query.toString();

    return queryString ? `${path}?${queryString}` : path;
  };

  return buildPath;
};
