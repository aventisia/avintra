import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";

import { CrudActionTypeLong } from "@/react-toolkit/constants";
import { NotFoundPage } from "@aventisia/ui/layout";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import {
    AccountDeactivation, DeviceHistory, EmailSettings, ProfileInfo, Security
} from "./features/my-account/components";
import {
    STCreatePage
} from "./features/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import {
    SupportTicketEditForm
} from "./features/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";
import { BillingPage } from "./pages/BillingPage";
import ComingSoon from "./pages/CommingSoon";
import { FlowsPage } from "./pages/FlowsPage";
import { LicensesPage } from "./pages/LicensesPage";
import { ModelsPage } from "./pages/ModelsPage";
import MyAccountPage from "./pages/MyAccountPage";
import { ExecutionsPage } from "./pages/orchestrator/ExecutionsPage";
import { KeystorePage } from "./pages/orchestrator/KeystorePage";
import { MachinesPage } from "./pages/orchestrator/MachinesPage";
import { Orchestrator } from "./pages/orchestrator/Orchestrator";
import { QueuesPage } from "./pages/orchestrator/QueuesPage";
import {
    QueuesWorkItemPayloadTablePages
} from "./pages/orchestrator/QueuesWorkItemPayloadTablePage";
import { QueuesWorkItemsPage } from "./pages/orchestrator/QueuesWorkItemsPage";
import { TriggersPage } from "./pages/orchestrator/TriggersPage";
import { VaultPage } from "./pages/orchestrator/VaultPage";
import { PricingPage } from "./pages/sa/PricingPage";
import { SaLicensesPage } from "./pages/sa/SaLicensesPage";
import { TenantsPage } from "./pages/sa/TenantsPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { TenantInfoPage } from "./pages/TenantsInfoPage";
import { UsersPage } from "./pages/UsersPage";

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
        path: "/home",
        element: <ComingSoon />,
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
        element: <TenantInfoPage />,
      },
      {
        path: "/billing",
        element: <BillingPage />,
      },
      {
        path: "/orchestrator",
        element: <Orchestrator />,
        errorElement: <AppErrorPage />,
        children: [
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
            path: "/orchestrator/queues/payload-table/:qid",
            element: <QueuesWorkItemPayloadTablePages />,
          },
          {
            path: "/orchestrator/executions/:id?/:a?",
            element: <ExecutionsPage />,
          },
          {
            path: "/orchestrator/triggers/:id?/:a?",
            element: <TriggersPage />,
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
            path: "/orchestrator/licenses/:id?/:a?",
            element: <LicensesPage />,
          },
        ],
      },
      {
        path: "sa",
        children: [
          {
            path: "/sa/tenants",
            element: <TenantsPage />,
            index: true,
          },
          {
            path: "/sa/licenses",
            element: <SaLicensesPage />,
          },
          {
            path: "/sa/pricing",
            element: <PricingPage />,
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
    path: "/redirect",
    element: <AppRedirectPage />,
    errorElement: <AppErrorPage />,
  },
];

export const router = createBrowserRouter(routerConfig, {
  basename: import.meta.env.BASE_URL,
}).subscribe((state) => {
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
