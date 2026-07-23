/**
 * useCarryParams
 *
 * A utility hook that helps preserve selected query parameters
 * from the current URL when navigating to a new route.
 *
 * Useful when you want to retain filters, pagination, or tabs
 *
 * @param params - List of query parameter keys to persist
 *
 * @returns buildPath - Function that appends selected query params to a given path
 *
 * @example
 * const buildPath = useCarryParams(["page", "search"]);
 *
 * const url = buildPath("/users");
 * // If current URL is: /dashboard?page=2&search=abc&filter=active
 * // Result: /users?page=2&search=abc
 *
 * @remarks
 * - Only parameters present in the current URL are carried forward
 * - Falsy values (null) are ignored
 * - Does not mutate existing search params
 */
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useCarryParams = (params: readonly string[]) => {
  const [searchParams] = useSearchParams();

  const buildPath = useCallback(
    (path: string) => {
      const query = new URLSearchParams();

      params.forEach((key) => {
        const value = searchParams.get(key);
        if (value !== null) query.set(key, value);
      });

      const queryString = query.toString();
      return queryString ? `${path}?${queryString}` : path;
    },
    [params, searchParams],
  );

  return buildPath;
};
