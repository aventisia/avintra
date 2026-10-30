import { useNavigate } from "react-router-dom";

export function useNavigateToTenant() {
  const navigate = useNavigate();
  const handleOpenTenant = (id: string, name: string) =>
    navigate({
      pathname: `/on-prem-tenants/${id}`,
      search: `?tname=${encodeURIComponent(name)}`,
    });

  return { handleOpenTenant };
}
