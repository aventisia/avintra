import { NotFoundPage } from "@avplatform/layout";
import { CrudActionTypeLong } from "@avplatform/ui/constants";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { Navigate, RouteObject, createBrowserRouter } from "react-router-dom";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import { ConversationsTable } from "./features/03-orchestrator/conversations-table/components/ConversationsTable";
import Chat from "./features/04-assist/my-chats/components/ChatSection";
import { STCreatePage } from "./features/05-tenant-admin/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import { SupportTicketEditForm } from "./features/05-tenant-admin/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";
import GALayout from "./features/07-global-admin/on-prem-tenant/components/GALayout";
import { FlowsPage } from "./pages/01-build/FlowsPage";
import { LibraryPage } from "./pages/01-build/LibraryPage";
import { KeystorePage } from "./pages/02-configure/KeystorePage";
import { VaultPage } from "./pages/02-configure/VaultPage";
import { KnowledgeBaseDetailsPage } from "./pages/02-configure/knowledge-bases/KnowledgeBaseDetailsPage";
import { KnowledgeBasePage } from "./pages/02-configure/knowledge-bases/KnowledgeBasePage";
import { QueuesPage } from "./pages/02-configure/queues/QueuesPage";
import { QueuesWorkItemsPage } from "./pages/02-configure/queues/QueuesWorkItemsPage";
import { EmailTriggerPage } from "./pages/02-configure/triggers/EmailTriggerPage";
import { MessageTriggerPage } from "./pages/02-configure/triggers/MessageTriggerPage";
import { TimeTriggerPage } from "./pages/02-configure/triggers/TimeTriggerPage";
import { WebhookTriggerPage } from "./pages/02-configure/triggers/WebhookTriggerPage";
import { JobsPage } from "./pages/03-orchestrator/JobsPage";
import { MachinesPage } from "./pages/03-orchestrator/MachinesPage";
import { PublishedAgentsPage } from "./pages/03-orchestrator/PublishedAgentsPage";
import { ConversationDetailsPage } from "./pages/03-orchestrator/conversations/ConversationDetailsPage";
import { AgentsAssistPage } from "./pages/04-assist/AgentsAssistPage";
import { MyChatsPage } from "./pages/04-assist/MyChatsPage";
import { MyQueuePage } from "./pages/04-assist/MyQueuePage";
import { AchievesPage } from "./pages/05-tenant-admin/AchievesPage";
import { CreditsUsagePage } from "./pages/05-tenant-admin/CreditsUsagePage";
import { AppIntegrationsPage } from "./pages/05-tenant-admin/IntegrationsPage";
import { PreferencesPage } from "./pages/05-tenant-admin/PreferencesPage";
import { SupportTicketsPage } from "./pages/05-tenant-admin/SupportTicketsPage";
import { TenantPage } from "./pages/05-tenant-admin/TenantPage";
import { TenantTemplatesApprovalPage } from "./pages/05-tenant-admin/TenantTemplatesApprovalPage";
import { UsersPage } from "./pages/05-tenant-admin/UsersPage";
import { CreditPlansPage } from "./pages/06-super-admin/CreditPlansPage";
import { OnPremLLMPage } from "./pages/06-super-admin/OnPremLLMPage";
import { PublicTemplatesApprovalPage } from "./pages/06-super-admin/PublicTemplatesApprovalPage";
import { SubscriptionPlansPage } from "./pages/06-super-admin/SubscriptionPlansPage";
import { TenantsPage } from "./pages/06-super-admin/TenantsPage";
import { OnPremTenantsPage } from "./pages/07-global-admin/OnPremTenantsPage";
import { TenantInstanceDataPage } from "./pages/07-global-admin/TenantInstanceDataPage";
import { TenantInstancePage } from "./pages/07-global-admin/TenantInstancePage";
import { GetDesktopPage } from "./pages/GetDesktopPage";
import MyAccountPage from "./pages/MyAccountPage";

const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <AppErrorPage />,
    children: [
      // build section
      {
        path: "/agents",
        element: <FlowsPage />,
      },
      {
        path: "/library",
        element: <LibraryPage />,
      },
      {
        path: "/account",
        element: <MyAccountPage />,
      },
      // configure section
      {
        path: "/configure",
        children: [
          {
            index: true,
            element: <Navigate to="queues" replace />,
          },
          {
            path: "queues/:id?/:a?",
            element: <QueuesPage />,
          },
          {
            path: "queues/work-items/:qid",
            element: <QueuesWorkItemsPage />,
          },
          {
            path: "triggers",
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
            path: "keystore/:id?/:a?",
            element: <KeystorePage />,
          },
          {
            path: "vault/:id?/:a?",
            element: <VaultPage />,
          },
          {
            path: "knowledge-base",
            children: [
              {
                index: true,
                element: <KnowledgeBasePage />,
              },
              {
                path: ":id",
                element: <KnowledgeBaseDetailsPage />,
              },
            ],
          },
        ],
      },
      // orchestrator section
      {
        path: "/orchestrator",
        children: [
          {
            index: true,
            element: <Navigate to="published-agents" replace />,
          },
          {
            path: "published-agents",
            element: <PublishedAgentsPage />,
          },
          {
            path: "machines/:id?/:a?",
            element: <MachinesPage />,
          },
          {
            path: "jobs",
            element: <JobsPage />,
          },
          {
            path: "conversations",
            children: [
              {
                index: true,
                element: <ConversationsTable />,
              },
              {
                path: ":id",
                element: <ConversationDetailsPage />,
              },
            ],
          },
        ],
      },
      // assist section
      {
        path: "/assist",
        children: [
          {
            index: true,
            element: <Navigate to="agents" replace />,
          },
          {
            path: "agents",
            element: <AgentsAssistPage />,
          },
          {
            path: "queues",
            element: <MyQueuePage />,
          },
          {
            path: "chats",
            element: <MyChatsPage />,
            children: [
              {
                path: ":flowVersionId",
                element: <Chat />,
              },
              {
                path: ":flowVersionId/:conversationId",
                element: <Chat />,
              },
            ],
          },
        ],
      },
      // tenantAdmin section
      {
        path: "/tenant",
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: "overview",
            element: <TenantPage />,
          },
          {
            path: "preferences",
            element: <PreferencesPage />, // Only applicabe in case of enterprise deployment
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "integrations",
            element: <AppIntegrationsPage />,
          },
          {
            path: "on-prem-models",
            element: <OnPremLLMPage />,
          },
          {
            path: "usage",
            element: <CreditsUsagePage />,
          },
          {
            path: "archive",
            element: <AchievesPage />,
          },
          {
            path: "approvals",
            element: <TenantTemplatesApprovalPage />,
          },
          {
            path: "support",
            children: [
              {
                index: true,
                element: <Navigate to="tickets" replace />,
              },
              {
                path: "tickets",
                element: <SupportTicketsPage />,
              },
              {
                path: "ticket/details",
                element: <SupportTicketEditForm />,
              },
              {
                path: "ticket/create",
                element: <STCreatePage />,
              },
            ],
          },
        ],
      },
      // superAdmin section
      {
        path: "/sa",
        children: [
          {
            path: "tenants",
            element: <TenantsPage />,
          },
          {
            path: "subscription-plans",
            element: <SubscriptionPlansPage />,
          },
          {
            path: "credit-plans",
            element: <CreditPlansPage />,
          },
          {
            path: "approvals",
            element: <PublicTemplatesApprovalPage />,
          },
        ],
      },
      // globalAdmin section
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
    path: "/redirect",
    element: <AppRedirectPage />,
    errorElement: <AppErrorPage />,
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

  // TODO: Need to validate whether we still need this or not
  {
    path: "/assist",
    element: <GetDesktopPage />,
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
