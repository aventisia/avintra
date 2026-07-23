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
    <Accordion
      type="single"
      collapsible
      className="mx-auto my-6 max-w-3xl space-y-6"
      defaultValue="profileInfo"
    >
      <AccordionItem value={"profileInfo"} className="rounded-xl border-none bg-slate-100/80">
        <AccordionTrigger className="p-4 text-base font-medium">Profile Info</AccordionTrigger>
        <AccordionContent className="border-t">
          <ProfileInfoTab />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value={"emailSetting"} className="rounded-xl border-none bg-slate-100/80">
        <AccordionTrigger className="p-4 text-base font-medium">Email Settings</AccordionTrigger>
        <AccordionContent className="border-t">
          <EmailSettingsTab />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value={"changePassword"} className="rounded-xl border-none bg-slate-100/80">
        <AccordionTrigger className="p-4 text-base font-medium">Change Password</AccordionTrigger>
        <AccordionContent className="border-t">
          <SecurityTab />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value={"deviceHistory"} className="rounded-xl border-none bg-slate-100/80">
        <AccordionTrigger className="p-4 text-base font-medium">Connected Devices</AccordionTrigger>
        <AccordionContent className="border-t">
          <DeviceHistoryTab />
        </AccordionContent>
      </AccordionItem>

      {/* <AccordionItem
        value={"accountDeactivation"}
        className="rounded-xl border-none bg-slate-100/80"
      >
        <AccordionTrigger className="p-4 text-base font-medium">
          Account Deactivation
        </AccordionTrigger>
        <AccordionContent className="border-t">
          <AccountDeactivationTab />
        </AccordionContent>
      </AccordionItem> */}
    </Accordion>
  );
}
