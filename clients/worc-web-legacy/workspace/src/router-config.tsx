import { CrudActionTypeLong } from "@/react-toolkit/constants";

import { NotFoundPage } from "@aventisia/ui/layout";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { Navigate, RouteObject, createBrowserRouter } from "react-router-dom";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import Chat from "./features/assist/my-chats/components/ChatSection";
// import { NoChatSelected } from "./features/assist/my-chats/components/NoChatSelected";
import GALayout from "./features/global-admin/on-prem-tenant/components/GALayout";
import {
  AccountDeactivation,
  DeviceHistory,
  EmailSettings,
  ProfileInfo,
  Security,
} from "./features/my-account/components";
import { STCreatePage } from "./features/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import { SupportTicketEditForm } from "./features/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";
import { AchievesPage } from "./pages/AchievesPage";
import { AgentsAssistPage } from "./pages/AgentsAssistPage";
import ComingSoon from "./pages/CommingSoon";
import { CreditsUsagePage } from "./pages/CreditsUsagePage";
import { FlowsPage } from "./pages/FlowsPage";
import { GetDesktopPage } from "./pages/GetDesktopPage";
import { AppIntegrationsPage } from "./pages/IntegrationsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ModelsPage } from "./pages/ModelsPage";
import MyAccountPage from "./pages/MyAccountPage";
import { MyChatsPage } from "./pages/MyChatsPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { PublicTemplatesApprovalPage } from "./pages/PublicTemplatesApprovalPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { TenantPage } from "./pages/TenantPage";
import { TenantTemplatesApprovalPage } from "./pages/TenantTemplatesApprovalPage";
import { UsersPage } from "./pages/UsersPage";
import { OnPremTenantsPage } from "./pages/global-admin/OnPremTenantsPage";
import { TenantInstanceDataPage } from "./pages/global-admin/TenantInstanceDataPage";
import { TenantInstancePage } from "./pages/global-admin/TenantInstancePage";
import { ExecutionLogsPage } from "./pages/orchestrator/ExecutionLogsPage";
import { JobsPage } from "./pages/orchestrator/JobsPage";
import { KeystorePage } from "./pages/orchestrator/KeystorePage";
import { KnowledgeBaseDetailsPage } from "./pages/orchestrator/KnowledgeBaseDetailsPage";
import { KnowledgeBasePage } from "./pages/orchestrator/KnowledgeBasePage";
import { MachinesPage } from "./pages/orchestrator/MachinesPage";
import { MyQueuePage } from "./pages/orchestrator/MyQueuePage";
import { Orchestrator } from "./pages/orchestrator/Orchestrator";
import { PublishedAgentsPage } from "./pages/orchestrator/PublishedAgentsPage";
import { QueuesPage } from "./pages/orchestrator/QueuesPage";
import { QueuesWorkItemsPage } from "./pages/orchestrator/QueuesWorkItemsPage";
import { VaultPage } from "./pages/orchestrator/VaultPage";
import { EmailTriggerPage } from "./pages/orchestrator/triggers/EmailTriggerPage";
import { MessageTriggerPage } from "./pages/orchestrator/triggers/MessageTriggerPage";
import { TimeTriggerPage } from "./pages/orchestrator/triggers/TimeTriggerPage";
import { WebhookTriggerPage } from "./pages/orchestrator/triggers/WebhookTriggerPage";
import { CreditPlansPage } from "./pages/sa/CreditPlansPage";
import { OnPremLLMPage } from "./pages/sa/OnPremLLMPage";
import { SubscriptionPlansPage } from "./pages/sa/SubscriptionPlansPage";
import { TenantsPage } from "./pages/sa/TenantsPage";

const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <AppErrorPage />,
    children: [
      {
        path: "/agents",
        element: <FlowsPage />,
      },
      {
        path: "/ai-models",
        element: <ModelsPage />,
      },
      {
        path: "/library",
        element: <LibraryPage />,
      },
      {
        path: "/home",
        element: <ComingSoon />,
      },
      {
        path: "/assist/agents",
        element: <AgentsAssistPage />,
      },
      {
        path: "/assist/queues",
        element: <MyQueuePage />,
      },
      // routes/assist.tsx

      {
        path: "/assist/chats",
        element: <MyChatsPage />,
        children: [
          {
            path: ":flowVersionId",
            element: <Chat />, // new chat
          },
          {
            path: ":flowVersionId/:conversationId",
            element: <Chat />, // existing chat
          },
        ],
      },
      {
        path: "/account",
        element: <MyAccountPage />,
        errorElement: <AppErrorPage />,
        children: [
          {
            index: true,
            path: "/account",
            element: <ProfileInfo />,
          },
          {
            path: "/account/email-settings",
            element: <EmailSettings />,
          },
          {
            path: "/account/security",
            element: <Security />,
          },
          {
            path: "/account/device-history",
            element: <DeviceHistory />,
          },
          {
            path: "/account/account-deactivation",
            element: <AccountDeactivation />,
          },
        ],
      },
      {
        path: "/marketplace",
        element: <ComingSoon />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/tenant",
        element: <TenantPage />,
      },
      {
        path: "/preferences",
        element: <PreferencesPage />,
      },
      {
        path: "/integrations",
        element: <AppIntegrationsPage />,
      },
      {
        path: "/on-prem-models",
        element: <OnPremLLMPage />,
      },
      {
        path: "/usage",
        element: <CreditsUsagePage />,
      },
      {
        path: "/archive",
        element: <AchievesPage />,
      },
      {
        path: "/approvals",
        element: <TenantTemplatesApprovalPage />,
      },
      {
        path: "/orchestrator",
        element: <Orchestrator />,
        errorElement: <AppErrorPage />,
        children: [
          {
            index: true,
            path: "/orchestrator/published-agents",
            element: <PublishedAgentsPage />,
          },
          {
            index: true,
            path: "/orchestrator/machines/:id?/:a?",
            element: <MachinesPage />,
          },
          {
            path: "/orchestrator/queues/:id?/:a?",
            element: <QueuesPage />,
          },
          {
            path: "/orchestrator/queues/work-items/:qid",
            element: <QueuesWorkItemsPage />,
          },
          {
            path: "/orchestrator/jobs",
            element: <JobsPage />,
          },
          {
            path: "/orchestrator/jobs/:id",
            element: <ExecutionLogsPage />,
          },
          {
            path: "/orchestrator/triggers",
            children: [
              {
                index: true,
                element: <Navigate to="time" replace />,
              },
              {
                path: "time",
                element: <TimeTriggerPage />,
              },
              {
                path: "email",
                element: <EmailTriggerPage />,
              },
              {
                path: "message",
                element: <MessageTriggerPage />,
              },
              {
                path: "webhook",
                element: <WebhookTriggerPage />,
              },
            ],
          },
          {
            path: "/orchestrator/keystore/:id?/:a?",
            element: <KeystorePage />,
          },
          {
            path: "/orchestrator/vault/:id?/:a?",
            element: <VaultPage />,
          },
          {
            path: "/orchestrator/knowledge-base",
            children: [
              {
                index: true, // /orchestrator/knowledge-base
                element: <KnowledgeBasePage />, // table/list view
              },
              {
                path: ":id", // /orchestrator/knowledge-base/:id
                element: <KnowledgeBaseDetailsPage />, // detail view
              },
            ],
          },
        ],
      },
      {
        path: "/ga",
        element: <GALayout />,
        children: [
          {
            path: "on-prem-tenants",
            children: [
              {
                index: true,
                element: <OnPremTenantsPage />,
              },
              {
                path: ":tid",
                children: [
                  {
                    index: true,
                    element: <TenantInstancePage />,
                  },
                  {
                    path: ":id",
                    element: <TenantInstanceDataPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/sa",
        children: [
          {
            path: "/sa/tenants",
            element: <TenantsPage />,
            index: true,
          },
          {
            path: "/sa/subscription-plans",
            element: <SubscriptionPlansPage />,
            index: true,
          },
          {
            path: "/sa/approvals",
            element: <PublicTemplatesApprovalPage />,
            index: true,
          },

          {
            path: "/sa/credit-plans",
            element: <CreditPlansPage />,
          },
          {
            path: "/sa/tenants-consumption",
            element: <ComingSoon />,
          },
        ],
      },
      {
        path: "/supportticket",
        element: <SupportTicketsPage />,
      },
      {
        path: "/supportticket-reviewer",
        element: <SupportTicketsReviewerPage />,
      },
      {
        path: "/supportticket/details",
        element: <SupportTicketEditForm />,
      },
      {
        path: "/supportticket/create",
        element: <STCreatePage />,
      },
      {
        path: "/page-not-found",
        element: <NotFoundPage />,
      },
      {
        path: "/*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/external/chats",
    element: <MyChatsPage mode="popover" />,
    children: [
      {
        path: ":flowVersionId",
        element: <Chat mode="popover" />, // new chat
      },
      {
        path: ":flowVersionId/:conversationId",
        element: <Chat mode="popover" />, // existing chat
      },
    ],
  },

  {
    path: "/assist",
    element: <GetDesktopPage />,
  },
  {
    path: "/redirect",
    element: <AppRedirectPage />,
    errorElement: <AppErrorPage />,
  },
];

export const router = createBrowserRouter(routerConfig, {
  basename: import.meta.env.BASE_URL,
});

router.subscribe((state) => {
  const currentMatch = state.matches[state.matches.length - 1];
  const id = currentMatch.params["id"];
  const action = currentMatch.params["a"];

  useDTCrudDialogStore.subscribe(
    (state) => state,
    (state) => {
      if (!!id && !!action && !!CrudActionTypeLong[action]) {
        state.setCrudDialogOptions({
          rowId: id ?? window.crypto.randomUUID(),
          crudAction: CrudActionTypeLong[action],
          showDialog: true,
        });
        state.setShowDialog(true);
      }
    },
  );
});
