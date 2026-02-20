"use client";

import { useRouter } from "next/navigation";

/**
 * Custom hook to view a template.
 *
 * Navigates to `/library?t={id}` in the same tab.
 *
 * @returns A function that takes a template ID and routes to the template.
 */
export const useViewTemplate = () => {
  const router = useRouter();

  const handleViewTemplate = (id: string) => {
    const url = `/library?t=${id}`;
    router.push(url);
  };

  return handleViewTemplate;
};
