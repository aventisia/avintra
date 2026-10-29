import {
  CrudDialogProvider,
  type CrudDialogRegistry,
  useCrudDialogUrlState,
} from "@avplatform/ui/data-table";
import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudEntityKey } from "@avplatform/ui/types";
import { Suspense, lazy, useEffect, useRef } from "react";
import { toast } from "sonner";

import { ROLE_OM } from "@/constants/roles";
import { ConfigureProdEnvBanner } from "@/features/02-configure/components/ConfigureProdEnvBanner";
import { getDialogHeadingDescription as getConfigStoreDialogHeadingDescription } from "@/features/02-configure/config-store-table/constants";
import { getDialogHeadingDescription as getKBDialogHeadingDescription } from "@/features/02-configure/knowledge-base/constants";
import { getDialogHeadingDescription as getQueueDialogHeadingDescription } from "@/features/02-configure/queues/queues-table/constants";
import { getDialogHeadingDescription as getSkillsDialogHeadingDescription } from "@/features/02-configure/skill-registry/constants";
import { getDialogHeadingDescription as getToolsDialogHeadingDescription } from "@/features/02-configure/tools/constants/tools-table.constants";
import { getDialogHeadingDescription as getEmailTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/email-triggers-table/constants";
import { getDialogHeadingDescription as getMessageTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/message-triggers-table/constants";
import { getDialogHeadingDescription as getTimeTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/time-triggers-table/constants";
import { getDialogHeadingDescription as getWebhookTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/webhook-triggers-table/constants";
import { getDialogHeadingDescription as getVaultCredentialDialogHeadingDescription } from "@/features/02-configure/vault-credentials/constants";
import { getDialogHeadingDescription as getApiKeyDialogHeadingDescription } from "@/features/03-orchestrator/api-keys/constants";
import { getDialogHeadingDescription as getJobDialogHeadingDescription } from "@/features/03-orchestrator/jobs-table/constants/variables";
import { getDialogHeadingDescription as getMachineDialogHeadingDescription } from "@/features/03-orchestrator/machines-table/constants";
import { getDialogHeadingDescription as getSpaceDialogHeadingDescription } from "@/features/05-tenant-admin/spaces/constants";
import { getDialogHeadingDescription as getTicketDialogHeadingDescription } from "@/features/05-tenant-admin/support-tickets-v2/constants";
import { getDialogHeadingDescription as getRoleDialogHeadingDescription } from "@/features/05-tenant-admin/user-management/tables/roles-table/constants";
import { getDialogHeadingDescription as getUserDialogHeadingDescription } from "@/features/05-tenant-admin/user-management/tables/users-table/constants";
import { getDialogHeadingDescription as getCreditPlanDialogHeadingDescription } from "@/features/06-super-admin/credit-plans-table/constants";
import { getSaDialogHeadingDescription as getSaNotificationDialogHeadingDescription } from "@/features/06-super-admin/sa-notifications/constants/sa-notifications-table.constant.ee";
import { getDialogHeadingDescription as getSubPlansDialogHeadingDescription } from "@/features/06-super-admin/subscription-plans-table/constants";
import { getDialogHeadingDescription as getSaTicketDialogHeadingDescription } from "@/features/06-super-admin/support-tickets/constants";
import { getDialogHeadingDescription as getTenantDialogHeadingDescription } from "@/features/06-super-admin/tenants-table/constants";
import { getDialogHeadingDescription as getTenantInstanceDialogHeadingDescription } from "@/features/07-global-admin/on-prem-tenant-instance/constants";
import { getDialogHeadingDescription as getOnPremTenantDialogHeadingDescription } from "@/features/07-global-admin/on-prem-tenant/constants";
import { getDialogHeadingDescription as getNotificationDialogHeadingDescription } from "@/features/notifications/constants/notifications-table.constant";
import { useEnvironmentStore } from "@/stores/environment-store";

const MachineCrudDialogContent = lazy(() =>
  import("@/features/03-orchestrator/machines-table/components/machine-crud-dialog/MachineCrudDialogContent").then(
    (m) => ({ default: m.MachineCrudDialogContent }),
  ),
);
const JobCrudDialogContent = lazy(() =>
  import("@/features/03-orchestrator/jobs-table/components/jobs-crud-dialog/JobCrudDialogContent").then(
    (m) => ({ default: m.JobCrudDialogContent }),
  ),
);
const FlowFormDialog = lazy(() =>
  import("@/features/01-build/flows-table/components/flow-crud-dialog/FlowFormDialog").then(
    (m) => ({ default: m.FlowFormDialog }),
  ),
);
const FolderCrudDialog = lazy(() =>
  import("@/features/01-build/flows-table/components/folder-dialogs/FolderCrudDialog").then(
    (m) => ({ default: m.FolderCrudDialog }),
  ),
);
const QueueCrudDialogContent = lazy(() =>
  import("@/features/02-configure/queues/queues-table/components/queue-crud-dialog/QueueCrudDialogContent").then(
    (m) => ({ default: m.QueueCrudDialogContent }),
  ),
);
const ConfigStoreCrudDialogContent = lazy(() =>
  import("@/features/02-configure/config-store-table/components/config-store-crud-dialog/ConfigStoreCrudDialogContent").then(
    (m) => ({ default: m.ConfigStoreCrudDialogContent }),
  ),
);
const KBCrudDialogContent = lazy(() =>
  import("@/features/02-configure/knowledge-base/components/kb-crud-dialog/KBCrudDialogContent").then(
    (m) => ({ default: m.KBCrudDialogContent }),
  ),
);
const SkillsCrudDialogContent = lazy(() =>
  import("@/features/02-configure/skill-registry/components/skill-crud-dialog/SkillCrudDialogContent").then(
    (m) => ({ default: m.SkillCrudDialogContent }),
  ),
);
const ToolCrudDialogContent = lazy(() =>
  import("@/features/02-configure/tools/components/tool-crud-dialog/ToolCrudDialog").then((m) => ({
    default: m.ToolCrudDialogContent,
  })),
);
const VaultCredentialCrudDialogContent = lazy(() =>
  import("@/features/02-configure/vault-credentials/components/vault-credential-crud-dialog/VaultCredentialCrudDialogContent").then(
    (m) => ({ default: m.VaultCredentialCrudDialogContent }),
  ),
);
const EmailTriggerCrudDialogContent = lazy(() =>
  import("@/features/02-configure/triggers/email-triggers-table/components/trigger-crud-dialog/EmailTriggerCrudDialogContent").then(
    (m) => ({ default: m.EmailTriggerCrudDialogContent }),
  ),
);
const MessageTriggerCrudDialogContent = lazy(() =>
  import("@/features/02-configure/triggers/message-triggers-table/components/trigger-crud-dialog/MessageTriggerCrudDialogContent").then(
    (m) => ({ default: m.MessageTriggerCrudDialogContent }),
  ),
);
const TimeTriggerCrudDialogContent = lazy(() =>
  import("@/features/02-configure/triggers/time-triggers-table/components/trigger-crud-dialog/TimeTriggerCrudDialogContent").then(
    (m) => ({ default: m.TimeTriggerCrudDialogContent }),
  ),
);
const WebhookTriggerCrudDialogContent = lazy(() =>
  import("@/features/02-configure/triggers/webhook-triggers-table/components/trigger-crud-dialog/WebhookTriggerCrudDialogContent").then(
    (m) => ({ default: m.WebhookTriggerCrudDialogContent }),
  ),
);
const CreditPlanCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/credit-plans-table/components/credit-plans-crud-dialog/CreditPlanCrudDialogContent.ee").then(
    (m) => ({ default: m.CreditPlanCrudDialogContent }),
  ),
);
const SubPlansCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/subscription-plans-table/components/sub-plans-crud-dialog/SubPlansCrudDialogContent.ee").then(
    (m) => ({ default: m.SubPlansCrudDialogContent }),
  ),
);
const TenantCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/tenants-table/components/tenant-crud-dialog/TenantCrudDialogContent.ee").then(
    (m) => ({ default: m.TenantCrudDialogContent }),
  ),
);
const TicketCrudDialogContent = lazy(() =>
  import("@/features/05-tenant-admin/support-tickets-v2/components/ticket-crud-dialog/TicketCrudDialogContent").then(
    (m) => ({ default: m.TicketCrudDialogContent }),
  ),
);
const SaTicketCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/support-tickets/components/ticket-crud-dialog/SaTicketCrudDialogContent.ee").then(
    (m) => ({ default: m.SaTicketCrudDialogContent }),
  ),
);
const OnPremTenantCrudDialogContent = lazy(() =>
  import("@/features/07-global-admin/on-prem-tenant/components/on-prem-tenant-crud-dialog/OnPremTenantCrudDialogContent.ee").then(
    (m) => ({ default: m.OnPremTenantCrudDialogContent }),
  ),
);
const TenantInstanceCrudDialogContent = lazy(() =>
  import("@/features/07-global-admin/on-prem-tenant-instance/components/tenant-instance-crud-dialog/TenantInstanceCrudDialogContent.ee").then(
    (m) => ({ default: m.TenantInstanceCrudDialogContent }),
  ),
);
const UserCrudDialogContent = lazy(() =>
  import("@/features/05-tenant-admin/user-management/tables/users-table/components/user-crud-dialog/UserCrudDialogContent").then(
    (m) => ({ default: m.UserCrudDialogContent }),
  ),
);
const RoleCrudDialogContent = lazy(() =>
  import("@/features/05-tenant-admin/user-management/tables/roles-table/components/role-crud-dialog/RoleCrudDialogContent").then(
    (m) => ({ default: m.RoleCrudDialogContent }),
  ),
);
const SpaceCrudDialogContent = lazy(() =>
  import("@/features/05-tenant-admin/spaces/components/space-crud-dialog/SpaceCrudDialogContent").then(
    (m) => ({ default: m.SpaceCrudDialogContent }),
  ),
);
const ApiKeyCrudDialogContent = lazy(() =>
  import("@/features/03-orchestrator/api-keys/components/api-key-crud-dialog/ApiKeyCrudDialogContent").then(
    (m) => ({ default: m.ApiKeyCrudDialogContent }),
  ),
);
const NotificationCrudDialogContent = lazy(() =>
  import("@/features/notifications/components/notification-crud-dialog/NotificationCrudDialogContent").then(
    (m) => ({ default: m.NotificationCrudDialogContent }),
  ),
);
const SaNotificationCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/sa-notifications/components/sa-notification-crud-dialog/SaNotificationCrudDialogContent.ee").then(
    (m) => ({ default: m.SaNotificationCrudDialogContent }),
  ),
);

const crudDialogRegistry: CrudDialogRegistry = {
  machine: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getMachineDialogHeadingDescription,
    Content: MachineCrudDialogContent,
  },
  job: {
    maxWidth: "!max-w-[42rem]",
    getHeader: getJobDialogHeadingDescription,
    Content: JobCrudDialogContent,
  },
  flow: {
    Dialog: FlowFormDialog,
  },
  folder: {
    Dialog: FolderCrudDialog,
  },
  queue: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getQueueDialogHeadingDescription,
    Content: QueueCrudDialogContent,
  },
  configstore: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getConfigStoreDialogHeadingDescription,
    Content: ConfigStoreCrudDialogContent,
  },
  knowledgeBase: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getKBDialogHeadingDescription,
    Content: KBCrudDialogContent,
  },
  skill: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getSkillsDialogHeadingDescription,
    Content: SkillsCrudDialogContent,
  },
  tool: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getToolsDialogHeadingDescription,
    Content: ToolCrudDialogContent,
  },
  vault: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getVaultCredentialDialogHeadingDescription,
    Content: VaultCredentialCrudDialogContent,
  },
  emailTrigger: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getEmailTriggerDialogHeadingDescription,
    Content: EmailTriggerCrudDialogContent,
  },
  messageTrigger: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getMessageTriggerDialogHeadingDescription,
    Content: MessageTriggerCrudDialogContent,
  },
  timeTrigger: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getTimeTriggerDialogHeadingDescription,
    Content: TimeTriggerCrudDialogContent,
  },
  webhookTrigger: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getWebhookTriggerDialogHeadingDescription,
    Content: WebhookTriggerCrudDialogContent,
  },
  creditPlan: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getCreditPlanDialogHeadingDescription,
    Content: CreditPlanCrudDialogContent,
  },
  subscriptionPlan: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getSubPlansDialogHeadingDescription,
    Content: SubPlansCrudDialogContent,
  },
  tenant: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getTenantDialogHeadingDescription,
    Content: TenantCrudDialogContent,
  },
  ticket: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getTicketDialogHeadingDescription,
    Content: TicketCrudDialogContent,
  },
  saSupportTicket: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getSaTicketDialogHeadingDescription,
    Content: SaTicketCrudDialogContent,
  },
  onPremTenant: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getOnPremTenantDialogHeadingDescription,
    Content: OnPremTenantCrudDialogContent,
  },
  tenantInstance: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getTenantInstanceDialogHeadingDescription,
    Content: TenantInstanceCrudDialogContent,
  },
  user: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getUserDialogHeadingDescription,
    Content: UserCrudDialogContent,
  },
  role: {
    maxWidth: "!max-w-[40rem]",
    getHeader: getRoleDialogHeadingDescription,
    Content: RoleCrudDialogContent,
  },
  space: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getSpaceDialogHeadingDescription,
    Content: SpaceCrudDialogContent,
  },
  apiKey: {
    maxWidth: "!max-w-[34rem]",
    getHeader: getApiKeyDialogHeadingDescription,
    Content: ApiKeyCrudDialogContent,
  },
  notification: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getNotificationDialogHeadingDescription,
    Content: NotificationCrudDialogContent,
  },
  saNotification: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getSaNotificationDialogHeadingDescription,
    Content: SaNotificationCrudDialogContent,
  },
};

/**
 * IMPORTANT NOTE: Keep this entity list aligned with the environment-scoped resource cases in
 * `apis/WorcBackend-legacy/WorkspaceAPIs/Helpers/ProdResourceUserAccessGuard.cs`.
 * Configure entities whose create dialogs are blocked in the Prod environment.
 * Create/delete are disabled for these resources when env = prod.
 */
const CONFIG_ENTITY_KEYS = new Set<CrudEntityKey>([
  "queue",
  "configstore",
  "knowledgeBase",
  "skill",
  "tool",
  "vault",
  "emailTrigger",
  "messageTrigger",
  "timeTrigger",
  "webhookTrigger",
]);

/**
 * Renders the single URL-driven CRUD dialog provider for the workspace app.
 *
 * Mounted once at the root layout. The actual dialog content is determined by
 * URL query params: `e` (entity), `ca` (action), `rid` (record id), and
 * optionally `back` (return state).
 *
 * When env = prod, create dialogs for Configure entities are blocked even if the
 * dialog was reached via a deep link; the reason is surfaced as a toast and the
 * dialog params are cleared.
 */
export function WorkspaceCrudDialogProvider() {
  const env = useEnvironmentStore((state) => state.env);
  const userSession = useUserSessionStore((state) => state.userSession);
  const { crudAction, entity, closeCrudDialog } = useCrudDialogUrlState();

  const isConfigureEntity = !!entity && CONFIG_ENTITY_KEYS.has(entity);
  const isProdUpdate = env === "prod" && crudAction === "update" && isConfigureEntity;

  const isBlockedCreate = env === "prod" && crudAction === "create" && isConfigureEntity;

  // Hold a Prod update dialog until the session (and therefore the user's role) is
  // known. Deciding while the session is null would briefly render the edit form
  // for every user and then close it.
  const isPendingProdEditAuth = isProdUpdate && !userSession;
  const isBlockedProdEdit =
    isProdUpdate && !!userSession && !userSession.userRoles.includes(ROLE_OM);
  const isBlockedAction = isBlockedCreate || isBlockedProdEdit;

  // The Configure dialog warning is only needed in Prod mode.
  const showEnvBanner = env === "prod" && isConfigureEntity;

  // Warn once per blocked attempt, then strip the dialog params from the URL.
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (!isBlockedAction) {
      notifiedRef.current = false;
      return;
    }

    if (!notifiedRef.current) {
      notifiedRef.current = true;
      toast.warning(
        isBlockedCreate
          ? "Creating resources is not available in PROD mode"
          : "Your role does not allow editing resources in PROD mode",
      );
    }

    closeCrudDialog();
  }, [isBlockedAction, isBlockedCreate, closeCrudDialog]);

  return (
    <Suspense fallback={<DataTableSkeleton />}>
      {isBlockedAction || isPendingProdEditAuth ? null : (
        <CrudDialogProvider
          registry={crudDialogRegistry}
          contentBanner={showEnvBanner ? <ConfigureProdEnvBanner className="mx-2" /> : undefined}
        />
      )}
    </Suspense>
  );
}
