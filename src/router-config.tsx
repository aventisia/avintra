import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { Navigate, type RouteObject } from "react-router-dom";
import { WorkspaceUILayout } from "./components/layout/WorkspaceUILayout";
import { AccountDeactivationTab } from "./features/my-account/components/account-deactivation-tab/AccountDeactivationTab";
import { DeviceHistoryTab } from "./features/my-account/components/device-history-tab/DeviceHistoryTab";
import { EmailSettingsTab } from "./features/my-account/components/email-settings-tab/EmailSettingsTab";
import { ProfileInfoTab } from "./features/my-account/components/profile-info-tab/ProfileInfoTab";
import { SecurityTab } from "./features/my-account/components/security-tab/SecurityTab";
import { STCreatePage } from "./features/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import { SupportTicketEditForm } from "./features/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";
import ComingSoon from "./pages/CommingSoon";
import { FlowsPage } from "./pages/FlowsPage";
import { ModelsPage } from "./pages/ModelsPage";
import MyAccountPage from "./pages/MyAccountPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { TenantsPage } from "./pages/TenantsPage";
import { UsersPage } from "./pages/UsersPage";

import { MachinesPage } from "./pages/orchestrator/MachinesPage";
import { AgentsPage } from "./pages/orchestrator/AgentsPage";
import { Orchestrator } from "./pages/orchestrator/Orchestrator";
import { QueuesPage } from "./pages/orchestrator/QueuesPage";
import { JobsPage } from "./pages/orchestrator/JobsPage";
import { ConfigsPage } from "./pages/orchestrator/ConfigsPage";
export const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <WorkspaceUILayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/projects" />,
      },
      {
        path: "/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/projects/agents",
        element: <FlowsPage />,
      },
      {
        path: "/projects/models",
        element: <ModelsPage />,
      },
      {
        path: "/home",
        element: <ComingSoon />,
      },
      {
        path: "/account",
        element: <MyAccountPage />,
        errorElement: import.meta.env.DEV && <ErrorPage />,
        children: [
          {
            index: true,
            path: "/account",
            element: <ProfileInfoTab />,
          },
          {
            path: "/account/email-settings",
            element: <EmailSettingsTab />,
          },
          {
            path: "/account/security",
            element: <SecurityTab />,
          },
          {
            path: "/account/device-history",
            element: <DeviceHistoryTab />,
          },
          {
            path: "/account/account-deactivation",
            element: <AccountDeactivationTab />,
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
        path: "/tenants",
        element: <TenantsPage />,
      },
      {
        path: "/orchestrator",
        element: <Orchestrator />,
        errorElement: import.meta.env.DEV && <ErrorPage />,
        children: [
          {
            index: true,
            path: "/orchestrator/machines",
            element: <MachinesPage />,
          },
          {
            path: "/orchestrator/agents",
            element: <AgentsPage />,
          },
          {
            path: "/orchestrator/queues",
            element: <QueuesPage />,
          },
          {
            path: "/orchestrator/execution",
            element: <JobsPage />,
          },
          {
            path: "/orchestrator/config-hub",
            element: <ConfigsPage />,
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
    element: <RedirectPage />,
    errorElement: <ErrorPage />,
  },
];
