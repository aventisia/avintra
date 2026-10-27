import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@avplatform/ui/accordion";

// import { AccountDeactivationTab } from "./account-deactivation-tab/AccountDeactivationTab";
import { DeviceHistoryTab } from "./device-history-tab/DeviceHistoryTab";
import { EmailSettingsTab } from "./email-settings-tab/EmailSettingsTab";
import { ProfileInfoTab } from "./profile-info-tab/ProfileInfoTab";
import { SecurityTab } from "./security-tab/SecurityTab";

export function MyAccount() {
  return (
    <div className="mx-auto my-6 max-w-3xl space-y-6">
      <h1 className="text-title text-ink">My Account</h1>
      <Accordion type="single" collapsible className="space-y-6" defaultValue="profileInfo">
        <AccordionItem value={"profileInfo"} className="rounded-lg border border-line bg-surface">
          <AccordionTrigger className="p-4 text-heading">Profile Info</AccordionTrigger>
          <AccordionContent className="border-t">
            <ProfileInfoTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value={"emailSetting"} className="rounded-lg border border-line bg-surface">
          <AccordionTrigger className="p-4 text-heading">Email Settings</AccordionTrigger>
          <AccordionContent className="border-t">
            <EmailSettingsTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value={"changePassword"}
          className="rounded-lg border border-line bg-surface"
        >
          <AccordionTrigger className="p-4 text-heading">Change Password</AccordionTrigger>
          <AccordionContent className="border-t">
            <SecurityTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value={"deviceHistory"} className="rounded-lg border border-line bg-surface">
          <AccordionTrigger className="p-4 text-heading">Connected Devices</AccordionTrigger>
          <AccordionContent className="border-t">
            <DeviceHistoryTab />
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem
        value={"accountDeactivation"}
        className="rounded-lg border border-line bg-surface"
      >
        <AccordionTrigger className="p-4 text-heading">
          Account Deactivation
        </AccordionTrigger>
        <AccordionContent className="border-t">
          <AccountDeactivationTab />
        </AccordionContent>
      </AccordionItem> */}
      </Accordion>
    </div>
  );
}
