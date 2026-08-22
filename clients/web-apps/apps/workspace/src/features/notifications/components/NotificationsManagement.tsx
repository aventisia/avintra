import { cn } from "@avplatform/ui/lib";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { Mail, Settings2 } from "lucide-react";
import { useState } from "react";

import NotificationSettingsPanel from "@/features/05-tenant-admin/tenant/components/BillingTabs/notifications/NotificationSettingsPanel";

import { NotificationsTable } from "./NotificationsTable";

/** Top-level view mode for the Notifications page. */
type NotificationsMode = "manual" | "auto";

/**
 * Management view for notifications within the current tenant.
 * A switch at the top lets the admin toggle between:
 *  - "Manual Notifications": the notifications broadcast table (create/view/edit/delete).
 *  - "Auto Notifications": the enable/disable notification settings panel.
 */
export const NotificationsManagement = () => {
  // Set the document title
  useDocumentTitle("Notifications");

  const [mode, setMode] = useState<NotificationsMode>("manual");

  return (
    <div className="space-y-6 py-4">
      {/* Manual / Auto switch */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted px-1.5 py-1.5">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
            mode === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Mail className="size-4 shrink-0" aria-hidden="true" />
          Manual Notifications
        </button>
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
            mode === "auto"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Settings2 className="size-4 shrink-0" aria-hidden="true" />
          Auto Notifications
        </button>
      </div>

      {mode === "auto" ? <NotificationSettingsPanel /> : <NotificationsTable />}
    </div>
  );
};
