import { useParams, useSearchParams } from "react-router-dom";

export function useTenantRoute() {
  const { tid, id } = useParams<{
    tid: string;
    id?: string;
  }>();

  const [searchParams] = useSearchParams();

  const tname = searchParams.get("tname") ?? "Tenant";
  const iname = searchParams.get("iname") ?? "Instance";

  return {
    tid,
    id,
    tname,
    iname,
  };
}
