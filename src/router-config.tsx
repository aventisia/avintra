import { WorkspaceUILayout } from "./components/layout/WorkspaceUILayout";
import { FlowsPage } from "./pages/FlowsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TenantsPage } from "./pages/TenantsPage";
import { UsersPage } from "./pages/UsersPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { STCreatePage } from "./features/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { SupportTicketEditForm } from "./features/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";
import ComingSoon from "./pages/CommingSoon";
import MyAccountPage from "./pages/MyAccountPage";
import { SecurityTab } from "./features/my-account/components/security-tab/SecurityTab";
import { EmailSettingsTab } from "./features/my-account/components/email-settings-tab/EmailSettingsTab";
import { DeviceHistoryTab } from "./features/my-account/components/device-history-tab/DeviceHistoryTab";
import { AccountDeactivationTab } from "./features/my-account/components/account-deactivation-tab/AccountDeactivationTab";
import { ProfileInfoTab } from "./features/my-account/components/profile-info-tab/ProfileInfoTab";
import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { Navigate, type RouteObject } from "react-router-dom";

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
