import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

import { getRoles } from "../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../constants";
import { CreateRoleDto } from "../dtos/create-role-dto";

/**
 * Custom hook to fetch roles using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchPermissionsAndFeature = () => {
  // Get roles using react query
  const { isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getRoles(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  const data: CreateRoleDto[] = [
    {
      featureName: "Project",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "Templates",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "Clients",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "Agents Manager",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "User Manager",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "Billing Manager",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
    {
      featureName: "Tenant Manager",
      all: false,
      create: false,
      delete: false,
      edit: false,
      view: false,
    },
  ];

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
