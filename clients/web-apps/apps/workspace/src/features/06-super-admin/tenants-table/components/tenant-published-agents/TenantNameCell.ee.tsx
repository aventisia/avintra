import { useNavigate } from "react-router-dom";

interface TenantNameCellProps {
  tenantId: string;
  tenantName: string;
}

export const TenantNameCell = ({ tenantId, tenantName }: TenantNameCellProps) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="truncate max-w-72 font-medium text-primary underline-offset-4 hover:underline"
      title={`View published agents for ${tenantName}`}
      onClick={() => {
        navigate(`/sa/tenants/${tenantId}?tname=${encodeURIComponent(tenantName)}`);
      }}
    >
      {tenantName}
    </button>
  );
};
