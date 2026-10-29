import { useNavigate } from "react-router-dom";

import { useTenantRoute } from "./useTenantRoute.ee";

export function useNavigateToInstance() {
  const navigate = useNavigate();
  const { tname } = useTenantRoute();
  const handleOpenInstance = (id: string, name: string) =>
    navigate({
      pathname: id,
      search: `?tname=${encodeURIComponent(tname)}&iname=${encodeURIComponent(name)}`,
    });

  return { handleOpenInstance };
}
