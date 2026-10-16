import { NotFoundPage } from "@avplatform/layout";
import { Navigate, RouteObject, createBrowserRouter } from "react-router-dom";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import { ConfigureLayout } from "./features/02-configure/ConfigureLayout";
import { ConversationsTable } from "./features/03-orchestrator/conversations-table/components/ConversationsTable";
import Chat from "./features/04-assist/my-chats/components/ChatSection";
import { InterfaceDetailPane } from "./features/04-assist/my-interfaces/components/InterfaceDetailPane";
import { InterfaceNoSelection } from "./features/04-assist/my-interfaces/components/InterfaceNoSelection";
import GALayout from "./features/07-global-admin/on-prem-tenant/components/GALayout.ee";
import { FlowsPage } from "./pages/01-build/FlowsPage";
import { FolderFlowsPage } from "./pages/01-build/FolderFlowsPage";
import { LibraryPage } from "./pages/01-build/LibraryPage";
import { ConfigStorePage } from "./pages/02-configure/ConfigStorePage";
import { UiBuilderPage } from "./pages/01-build/UiBuilderPage";
import { OAuthCallbackPage } from "./pages/02-configure/OAuthCallbackPage";
import { VaultCredentialPage } from "./pages/02-configure/VaultCredentialPage";
import { KnowledgeBaseDetailsPage } from "./pages/02-configure/knowledge-bases/KnowledgeBaseDetailsPage";
import { KnowledgeBasePage } from "./pages/02-configure/knowledge-bases/KnowledgeBasePage";
import { QueueWorkItemDetailPage } from "./pages/02-configure/queues/QueueWorkItemDetailPage";
import { QueuesPage } from "./pages/02-configure/queues/QueuesPage";
import { QueuesWorkItemsPage } from "./pages/02-configure/queues/QueuesWorkItemsPage";
import { SkillDetailsPage } from "./pages/02-configure/skill-registry/SkillsDetailsPage";
import { SkillPage } from "./pages/02-configure/skill-registry/SkillsPage";
import { ToolDetailsPage } from "./pages/02-configure/tools/ToolDetailsPage";
import { ToolsPage } from "./pages/02-configure/tools/ToolsPage";
import { EmailTriggerPage } from "./pages/02-configure/triggers/EmailTriggerPage";
import { MessageTriggerPage } from "./pages/02-configure/triggers/MessageTriggerPage";
import { TimeTriggerPage } from "./pages/02-configure/triggers/TimeTriggerPage";
import { WebhookTriggerPage } from "./pages/02-configure/triggers/WebhookTriggerPage";
import { AiGovernancePage } from "./pages/03-orchestrator/AiGovernancePage";
import { ApiKeysPage } from "./pages/03-orchestrator/ApiKeysPage";
import { JobsPage } from "./pages/03-orchestrator/JobsPage";
import { MachinesPage } from "./pages/03-orchestrator/MachinesPage";
import { PublishedAgentsPage } from "./pages/03-orchestrator/PublishedAgentsPage";
import { ConversationDetailsPage } from "./pages/03-orchestrator/conversations/ConversationDetailsPage";
import { AgentsAssistPage } from "./pages/04-assist/AgentsAssistPage";
import { MyChatsPage } from "./pages/04-assist/MyChatsPage";
import { MyQueuePage } from "./pages/04-assist/MyQueuePage";
import { UserInterfacesPage } from "./pages/04-assist/UserInterfacesPage";
import { AchievesPage } from "./pages/05-tenant-admin/AchievesPage";
import { CreditsUsagePage } from "./pages/05-tenant-admin/CreditsUsagePage";
import { GetStartedPageLazy } from "./pages/05-tenant-admin/GetStartedPage";
import { AppIntegrationsPage } from "./pages/05-tenant-admin/IntegrationsPage";
import { ModelProvidersPage } from "./pages/05-tenant-admin/ModelProvidersPage";
import { NotificationsPage } from "./pages/05-tenant-admin/NotificationsPage";
import { PreferencesPage } from "./pages/05-tenant-admin/PreferencesPage";
import { SpacesPage } from "./pages/05-tenant-admin/SpacesPage";
import SupportTicketV2DetailPage from "./pages/05-tenant-admin/SupportTicketV2DetailPage";
import SupportTicketsV2Page from "./pages/05-tenant-admin/SupportTicketsV2Page";
import { TenantPage } from "./pages/05-tenant-admin/TenantPage";
import { TenantTemplatesApprovalPage } from "./pages/05-tenant-admin/TenantTemplatesApprovalPage";
import { UsersPage } from "./pages/05-tenant-admin/UsersPage";
import { CreditPlansPage } from "./pages/06-super-admin/CreditPlansPage";
import { PublicTemplatesApprovalPage } from "./pages/06-super-admin/PublicTemplatesApprovalPage";
import { SaNotificationsPage } from "./pages/06-super-admin/SaNotificationsPage";
import SaSupportTicketDetailPage from "./pages/06-super-admin/SaSupportTicketDetailPage";
import SaSupportTicketsPage from "./pages/06-super-admin/SaSupportTicketsPage";
import { SubscriptionPlansPage } from "./pages/06-super-admin/SubscriptionPlansPage";
import { TenantPublishedAgentsPage } from "./pages/06-super-admin/TenantPublishedAgentsPage";
import { TenantsPage } from "./pages/06-super-admin/TenantsPage";
import { OnPremTenantsPage } from "./pages/07-global-admin/OnPremTenantsPage";
import { TenantInstanceDataPage } from "./pages/07-global-admin/TenantInstanceDataPage";
import { TenantInstancePage } from "./pages/07-global-admin/TenantInstancePage";
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
        path: "/agents/folders/:folderId",
        element: <FolderFlowsPage />,
      },
      {
        path: "/library",
        element: <LibraryPage />,
      },
      {
        path: "/ui-builder",
        element: <UiBuilderPage />,
      },
      {
        path: "/account",
        element: <MyAccountPage />,
      },
      // configure section
      {
        path: "/configure",
        element: <ConfigureLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="queues" replace />,
          },
          {
            path: "queues",
            element: <QueuesPage />,
          },
          {
            path: "queues/work-items/:qid",
            element: <QueuesWorkItemsPage />,
          },
          {
            path: "queues/work-items/:qid/wid/:wid",
            element: <QueueWorkItemDetailPage />,
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
            path: "configstore",
            element: <ConfigStorePage />,
          },
          {
            path: "vault",
            element: <VaultCredentialPage />,
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
          {
            path: "skill-registry",
            children: [
              {
                index: true,
                element: <SkillPage />,
              },
              {
                path: ":id",
                element: <SkillDetailsPage />,
              },
            ],
          },
          {
            path: "tools",
            children: [
              {
                index: true,
                element: <ToolsPage />,
              },
              {
                path: ":id",
                element: <ToolDetailsPage />,
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
            path: "agent-risk-registry",
            element: <AiGovernancePage />,
          },
          {
            path: "machines",
            element: <MachinesPage />,
          },
          {
            path: "jobs",
            element: <JobsPage />,
          },
          {
            path: "api-keys",
            element: <ApiKeysPage />,
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
          {
            path: "user-interfaces",
            element: <UserInterfacesPage />,
            children: [
              {
                index: true,
                element: <InterfaceNoSelection />,
              },
              {
                path: ":id",
                element: <InterfaceDetailPane />,
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
            path: "get-started",
            element: <GetStartedPageLazy />,
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
            path: "spaces",
            element: <SpacesPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "integrations",
            element: <AppIntegrationsPage />,
          },
          {
            path: "model-providers",
            element: <ModelProvidersPage />,
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
                element: <SupportTicketsV2Page />,
              },
              {
                path: "tickets/:id",
                element: <SupportTicketV2DetailPage />,
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
            path: "tenants/:tid",
            element: <TenantPublishedAgentsPage />,
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
          {
            path: "notifications",
            element: <SaNotificationsPage />,
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
                element: <SaSupportTicketsPage />,
              },
              {
                path: "tickets/:id",
                element: <SaSupportTicketDetailPage />,
              },
            ],
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
    path: "/configure/vault/oauth-callback",
    element: <OAuthCallbackPage />,
    errorElement: <AppErrorPage />,
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
];

export const router = createBrowserRouter(routerConfig, {
  basename: import.meta.env.BASE_URL,
});
