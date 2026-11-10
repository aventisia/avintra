import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useState } from "react";

import { PersonAvatar } from "@/components/PersonAvatar";
import { CardDialog } from "@/components/card-dialog/CardDialog";

import { useAccountDialogUrlState } from "../../hooks/useAccountDialogUrlState";
import { DeviceHistoryTab } from "../device-history-tab/DeviceHistoryTab";
import { EmailSettingsTab } from "../email-settings-tab/EmailSettingsTab";
import { UserForm } from "../profile-info-tab/UserForm";
import { SecurityTab } from "../security-tab/SecurityTab";

const ACCOUNT_TABS = [
  { value: "profile", label: "Profile", Panel: UserForm },
  { value: "email", label: "Email", Panel: EmailSettingsTab },
  { value: "password", label: "Password", Panel: SecurityTab },
  { value: "devices", label: "Devices", Panel: DeviceHistoryTab },
] as const;

/**
 * My account card dialog: profile, sign-in email, password and signed-in devices as tabs. Each tab
 * renders its own footer into the card footer while it is the active tab.
 */
export const AccountDialog = () => {
  const { accountTab, setAccountTab } = useAccountDialogUrlState();
  const userSession = useUserSessionStore((state) => state.userSession);
  const activeTab =
    ACCOUNT_TABS.find(({ value }) => value === accountTab)?.value ?? ACCOUNT_TABS[0].value;
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);

  const fullName = [userSession?.firstName, userSession?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || userSession?.email || "";

  return (
    <CardDialog
      isOpen={accountTab !== null}
      onClose={() => setAccountTab(null)}
      isOutsideClickLocked
      widthClassName="w-[min(34rem,calc(100vw-2rem))]"
      mark={<PersonAvatar name={displayName} className="size-12 text-base" />}
      eyebrow="My account"
      title={displayName}
      footer={
        <div
          ref={setFooterSlot}
          className="flex w-full min-w-0 items-center justify-between gap-4"
        />
      }
    >
      <Tabs value={activeTab} onValueChange={setAccountTab}>
        <TabsList className="sticky top-0 z-10 mb-5 flex w-full bg-popover">
          {ACCOUNT_TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ACCOUNT_TABS.map(({ value, Panel }) => (
          <TabsContent
            key={value}
            value={value}
            forceMount
            className="mt-0 data-[state=inactive]:hidden"
          >
            <Panel footerSlot={activeTab === value ? footerSlot : null} />
          </TabsContent>
        ))}
      </Tabs>
    </CardDialog>
  );
};
