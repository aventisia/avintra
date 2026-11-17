import { PersonAvatar } from "@avplatform/ui/avatar";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useEffect, useRef, useState } from "react";

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
  // The URL owns open state and reload restore, but a click must switch instantly
  // instead of waiting on router navigation, so selection lives in local state.
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const lastAccountTabRef = useRef<string | null>(null);

  useEffect(() => {
    // Follow the URL only when the dialog opens or closes. While open, tab
    // switches stay local: other widgets rewrite the shared search params from
    // stale snapshots, which would otherwise drag the tab back.
    if (lastAccountTabRef.current === null && accountTab !== null) {
      setSelectedTab(accountTab);
    } else if (accountTab === null) {
      setSelectedTab(null);
    }
    lastAccountTabRef.current = accountTab;
  }, [accountTab]);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setAccountTab(tab);
  };

  const activeTab =
    ACCOUNT_TABS.find(({ value }) => value === selectedTab)?.value ?? ACCOUNT_TABS[0].value;
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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
