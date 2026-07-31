import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { CrudDialogProvider, type CrudDialogRegistry } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

import { getDialogHeadingDescription as getFlowDialogHeadingDescription } from "@/features/01-build/flows-table/constants";
import { getDialogHeadingDescription as getKeystoreDialogHeadingDescription } from "@/features/02-configure/keystore-table/constants";
import { getDialogHeadingDescription as getKBDialogHeadingDescription } from "@/features/02-configure/knowledge-base/constants";
import { getDialogHeadingDescription as getQueueDialogHeadingDescription } from "@/features/02-configure/queues/queues-table/constants";
import { getDialogHeadingDescription as getSkillsDialogHeadingDescription } from "@/features/02-configure/skills/constants";
import { getDialogHeadingDescription as getToolsDialogHeadingDescription } from "@/features/02-configure/tools/constants/tools-table.constants";
import { getDialogHeadingDescription as getEmailTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/email-triggers-table/constants";
import { getDialogHeadingDescription as getMessageTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/message-triggers-table/constants";
import { getDialogHeadingDescription as getTimeTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/time-triggers-table/constants";
import { getDialogHeadingDescription as getWebhookTriggerDialogHeadingDescription } from "@/features/02-configure/triggers/webhook-triggers-table/constants";
import { getDialogHeadingDescription as getVaultDialogHeadingDescription } from "@/features/02-configure/vault-table/constants";
import { getDialogHeadingDescription as getJobDialogHeadingDescription } from "@/features/03-orchestrator/jobs-table/constants/variables";
import { getDialogHeadingDescription as getMachineDialogHeadingDescription } from "@/features/03-orchestrator/machines-table/constants";
import { getDialogHeadingDescription as getSupportTicketDialogHeadingDescription } from "@/features/05-tenant-admin/support-tickets-table/constants/constants";
import { getDialogHeadingDescription as getRoleDialogHeadingDescription } from "@/features/05-tenant-admin/user-management/tables/roles-table/constants";
import { getDialogHeadingDescription as getUserDialogHeadingDescription } from "@/features/05-tenant-admin/user-management/tables/users-table/constants";
import { getDialogHeadingDescription as getCreditPlanDialogHeadingDescription } from "@/features/06-super-admin/credit-plans-table/constants";
import { getDialogHeadingDescription as getOnPremLLMDialogHeadingDescription } from "@/features/06-super-admin/on-prem-llm-table/constants";
import { getDialogHeadingDescription as getSubPlansDialogHeadingDescription } from "@/features/06-super-admin/subscription-plans-table/constants";
import { getDialogHeadingDescription as getTenantDialogHeadingDescription } from "@/features/06-super-admin/tenants-table/constants";
import { getDialogHeadingDescription as getTenantInstanceDialogHeadingDescription } from "@/features/07-global-admin/on-prem-tenant-instance/constants";
import { getDialogHeadingDescription as getOnPremTenantDialogHeadingDescription } from "@/features/07-global-admin/on-prem-tenant/constants";

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
const FlowCrudDialogContent = lazy(() =>
  import("@/features/01-build/flows-table/components/flow-crud-dialog/FlowCrudDialogContent").then(
    (m) => ({ default: m.FlowCrudDialogContent }),
  ),
);
const QueueCrudDialogContent = lazy(() =>
  import("@/features/02-configure/queues/queues-table/components/queue-crud-dialog/QueueCrudDialogContent").then(
    (m) => ({ default: m.QueueCrudDialogContent }),
  ),
);
const KeystoreCrudDialogContent = lazy(() =>
  import("@/features/02-configure/keystore-table/components/keystore-crud-dialog/KeystoreCrudDialogContent").then(
    (m) => ({ default: m.KeystoreCrudDialogContent }),
  ),
);
const KBCrudDialogContent = lazy(() =>
  import("@/features/02-configure/knowledge-base/components/kb-crud-dialog/KBCrudDialogContent").then(
    (m) => ({ default: m.KBCrudDialogContent }),
  ),
);
const SkillsCrudDialogContent = lazy(() =>
  import("@/features/02-configure/skills/components/skill-crud-dialog/SkillCrudDialogContent").then(
    (m) => ({ default: m.SkillCrudDialogContent }),
  ),
);
const ToolCrudDialogContent = lazy(() =>
  import("@/features/02-configure/tools/components/tool-crud-dialog/ToolCrudDialog").then(
    (m) => ({ default: m.ToolCrudDialogContent }),
  ),
);
const VaultCrudDialogContent = lazy(() =>
  import("@/features/02-configure/vault-table/components/vault-crud-dialog/VaultCrudDialogContent").then(
    (m) => ({ default: m.VaultCrudDialogContent }),
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
  import("@/features/06-super-admin/credit-plans-table/components/credit-plans-crud-dialog/CreditPlanCrudDialogContent").then(
    (m) => ({ default: m.CreditPlanCrudDialogContent }),
  ),
);
const OnPremCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/on-prem-llm-table/components/on-prem-crud-dialog/OnPremCrudDialogContent").then(
    (m) => ({ default: m.OnPremCrudDialogContent }),
  ),
);
const SubPlansCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/subscription-plans-table/components/sub-plans-crud-dialog/SubPlansCrudDialogContent").then(
    (m) => ({ default: m.SubPlansCrudDialogContent }),
  ),
);
const TenantCrudDialogContent = lazy(() =>
  import("@/features/06-super-admin/tenants-table/components/tenant-crud-dialog/TenantCrudDialogContent").then(
    (m) => ({ default: m.TenantCrudDialogContent }),
  ),
);
const SupportTicketCrudDialogContent = lazy(() =>
  import("@/features/05-tenant-admin/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketCrudDialogContent").then(
    (m) => ({ default: m.SupportTicketCrudDialogContent }),
  ),
);
const OnPremTenantCrudDialogContent = lazy(() =>
  import("@/features/07-global-admin/on-prem-tenant/components/on-prem-tenant-crud-dialog/OnPremTenantCrudDialogContent").then(
    (m) => ({ default: m.OnPremTenantCrudDialogContent }),
  ),
);
const TenantInstanceCrudDialogContent = lazy(() =>
  import("@/features/07-global-admin/on-prem-tenant-instance/components/tenant-instance-crud-dialog/TenantInstanceCrudDialogContent").then(
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
    maxWidth: "!max-w-[32rem]",
    getHeader: getFlowDialogHeadingDescription,
    Content: FlowCrudDialogContent,
  },
  queue: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getQueueDialogHeadingDescription,
    Content: QueueCrudDialogContent,
  },
  keystore: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getKeystoreDialogHeadingDescription,
    Content: KeystoreCrudDialogContent,
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
    getHeader: getVaultDialogHeadingDescription,
    Content: VaultCrudDialogContent,
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
  onPremLLM: {
    maxWidth: "!max-w-[36rem]",
    getHeader: getOnPremLLMDialogHeadingDescription,
    Content: OnPremCrudDialogContent,
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
  supportTicket: {
    maxWidth: "!max-w-[32rem]",
    getHeader: getSupportTicketDialogHeadingDescription,
    Content: SupportTicketCrudDialogContent,
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
};

/**
 * Renders the single URL-driven CRUD dialog provider for the workspace app.
 *
 * Mounted once at the root layout. The actual dialog content is determined by
 * URL query params: `e` (entity), `ca` (action), `rid` (record id), and
 * optionally `back` (return state).
 */
export function WorkspaceCrudDialogProvider() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <CrudDialogProvider registry={crudDialogRegistry} />
    </Suspense>
  );
}
