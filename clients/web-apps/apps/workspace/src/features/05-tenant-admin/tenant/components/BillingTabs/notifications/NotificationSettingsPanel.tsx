import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@avplatform/ui/cards";

import NotificationsForm from "./NotificationsForm";

/**
 * Panel wrapper for the tenant notification enable/disable settings.
 * Renders the delivery channel + per-notification-type toggles so admins can
 * enable or disable how notifications are delivered.
 */
const NotificationSettingsPanel = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Notification Settings</CardTitle>
        <CardDescription>
          Enable or disable how notifications are delivered to recipients in this tenant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationsForm />
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsPanel;
