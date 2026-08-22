import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { NotificationsTable } from "./NotificationsTable";

/** Top-level view mode for the Notifications page. */
export type NotificationsMode = "manual" | "auto";

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

  const location = useLocation();

  // Reset to the "Manual" mode on any client-side navigation to this page (e.g.
  // clicking the sidebar menu item, even when already on this route). A full
  // page refresh keeps the persisted mode so in-progress work is not lost —
  // React Router sets location.key to "default" on a fresh load, and to a new
  // random key on client-side navigation.
  const prevKey = useRef(location.key);
  useEffect(() => {
    if (prevKey.current !== location.key) {
      setMode("manual");
    }
    prevKey.current = location.key;
  }, [location.key]);

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <NotificationsTable mode={mode} onModeChange={setMode} />
    </div>
  );
};


