import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { WorkspaceUILayout } from "./components/layout/WorkspaceUILayout";
import { FlowsPage } from "./pages/FlowsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TenantsPage } from "./pages/TenantsPage";
import { UsersPage } from "./pages/UsersPage";
import { SupportTicketsPage } from "./pages/SupportTicketsPage";
import { STCreatePage } from "./features/support-tickets-table/components/support-ticket-create-page/STCreatePage";
import { SupportTicketsReviewerPage } from "./pages/SupportTicketsReviewerPage";
import { SupportTicketEditForm } from "./features/support-tickets-table/components/support-ticket-crud-dialog/SupportTicketEditForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const router = createBrowserRouter(
  [
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
          path: "/project/flows",
          element: <FlowsPage />,
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
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
