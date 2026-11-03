import { Button } from "@avplatform/ui/buttons";
import { GearIcon } from "@phosphor-icons/react";

/**
 * Renders a button that represents a link to the notification settings.
 * This component is used in the unread notifications section.
 */
export const UNSettingsLink = () => {
  return (
    <Button variant="ghost" size="icon8">
      <GearIcon className="h-5 w-5" />
      <span className="sr-only">Settings</span>
    </Button>
  );
};
