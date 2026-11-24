import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { CpuIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import { ROLE_TA } from "@/constants/roles";
import { MODEL_PROVIDERS_ROUTE } from "@/features/05-tenant-admin/model-providers";

const NOTICE_CLASS = "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-ink-2";

/**
 * Composer notice for a tenant with no text model enabled. Only tenant admins can list models,
 * so only they see it; the link shows while the admin role is selected, since the page needs it.
 */
export const HomeChatNoModelNotice = () => {
  const isAdminRoleSelected = useBaseLayoutStore((state) => state.selectedRoles.includes(ROLE_TA));

  if (!isAdminRoleSelected) {
    return (
      <span className={NOTICE_CLASS}>
        <CpuIcon className="size-3.5 shrink-0" />
        No model enabled.
      </span>
    );
  }

  return (
    <Link
      to={MODEL_PROVIDERS_ROUTE}
      className={`${NOTICE_CLASS} transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`}
    >
      <CpuIcon className="size-3.5 shrink-0" />
      No model enabled. Configure models
    </Link>
  );
};
