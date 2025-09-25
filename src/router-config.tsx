import { NotFoundPage } from "@aventisia/ui/layout";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";

import { CrudActionTypeLong } from "@/react-toolkit/constants";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
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
import ComingSoon from "./pages/CommingSoon";
import { CreditsUsagePage } from "./pages/CreditsUsagePage";
import { FlowsPage } from "./pages/FlowsPage";
import { AppIntegrationsPage } from "./pages/IntegrationsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ModelsPage } from "./pages/ModelsPage";
import MyAccountPage from "./pages/MyAccountPage";
import { ExecutionsPage } from "./pages/orchestrator/ExecutionsPage";
import { KeystorePage } from "./pages/orchestrator/KeystorePage";
import { MachinesPage } from "./pages/orchestrator/MachinesPage";
import { Orchestrator } from "./pages/orchestrator/Orchestrator";
import { PublishedAgentsPage } from "./pages/orchestrator/PublishedAgentsPage";
import { QueuesPage } from "./pages/orchestrator/QueuesPage";
import { QueuesWorkItemsPage } from "./pages/orchestrator/QueuesWorkItemsPage";
import { TriggersPage } from "./pages/orchestrator/TriggersPage";
import { VaultPage } from "./pages/orchestrator/VaultPage";
import { PublicTemplatesApprovalPage } from "./pages/PublicTemplatesApprovalPage";
import { CreditPlansPage } from "./pages/sa/CreditPlansPage";
import { OnPremLLMPage } from "./pages/sa/OnPremLLMPage";
import { SubscriptionPlansPage } from "./pages/sa/SubscriptionPlansPage";
import { TenantsPage } from "./pages/sa/TenantsPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { TenantPage } from "./pages/TenantPage";
import { TenantTemplatesApprovalPage } from "./pages/TenantTemplatesApprovalPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./ProtectedRoute";

const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <AppErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/agents" />,
      },
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
        element: (
          <ProtectedRoute persmissions={["SA"]} page={<ComingSoon />} />
        ),
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
        element: (
          <ProtectedRoute persmissions={["SA"]} page={<ComingSoon />} />
        ),
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute persmissions={["SA", "TA"]} page={<UsersPage />} />
        ),
      },
      {
        path: "/tenant",
        element: (
          <ProtectedRoute persmissions={["SA", "TA"]} page={<TenantPage />} />
        ),
      },
      {
        path: "/integrations",
        element: (
          <ProtectedRoute
            persmissions={["SA", "TA"]}
            page={<AppIntegrationsPage />}
          />
        ),
      },
      {
        path: "/credits-usage",
        element: (
          <ProtectedRoute
            persmissions={["SA", "TA"]}
            page={<CreditsUsagePage />}
          />
        ),
      },
      {
        path: "/approvals",
        element: (
          <ProtectedRoute
            persmissions={["SA", "TA"]}
            page={<TenantTemplatesApprovalPage />}
          />
        ),
      },
      {
        path: "/orchestrator",
        element: <Orchestrator />,
        errorElement: <AppErrorPage />,
        children: [
          {
            index: true,
            path: "/orchestrator/published-agents",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<PublishedAgentsPage />}
              />
            ),
          },
          {
            index: true,
            path: "/orchestrator/machines/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<MachinesPage />}
              />
            ),
          },
          {
            path: "/orchestrator/queues/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<QueuesPage />}
              />
            ),
          },
          {
            path: "/orchestrator/queues/work-items/:qid",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<QueuesWorkItemsPage />}
              />
            ),
          },
          {
            path: "/orchestrator/executions/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<ExecutionsPage />}
              />
            ),
          },
          {
            path: "/orchestrator/triggers/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<TriggersPage />}
              />
            ),
          },
          {
            path: "/orchestrator/keystore/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<KeystorePage />}
              />
            ),
          },
          {
            path: "/orchestrator/vault/:id?/:a?",
            element: (
              <ProtectedRoute
                persmissions={["SA", "TA", "OM"]}
                page={<VaultPage />}
              />
            ),
          },
        ],
      },
      {
        path: "/sa",
        children: [
          {
            path: "/sa/tenants",
            element: (
              <ProtectedRoute persmissions={["SA"]} page={<TenantsPage />} />
            ),
            index: true,
          },
          {
            path: "/sa/subscription-plans",
            element: (
              <ProtectedRoute
                persmissions={["SA"]}
                page={<SubscriptionPlansPage />}
              />
            ),
            index: true,
          },
          {
            path: "/sa/approvals",
            element: (
              <ProtectedRoute
                persmissions={["SA"]}
                page={<PublicTemplatesApprovalPage />}
              />
            ),
            index: true,
          },
          {
            path: "/sa/on-prem-llms",
            element: (
              <ProtectedRoute persmissions={["SA"]} page={<OnPremLLMPage />} />
            ),
          },
          {
            path: "/sa/credit-plans",
            element: (
              <ProtectedRoute
                persmissions={["SA"]}
                page={<CreditPlansPage />}
              />
            ),
          },
          {
            path: "/sa/tenants-consumption",
            element: (
              <ProtectedRoute persmissions={["SA"]} page={<ComingSoon />} />
            ),
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
        path: "/archive",
        element: (
          <ProtectedRoute persmissions={["SA", "TA"]} page={<AchievesPage />} />
        ),
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
