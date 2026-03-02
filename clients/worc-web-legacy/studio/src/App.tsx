import { AppErrorPage } from "./components/layout/AppErrorPage";
import { NotFoundPage } from "@aventisia/ui/layout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { FlowPage } from "./pages/FlowPage";
import { AgentsAssistPage } from "./pages/AgentsAssistPage";
import { AgentHistoryPage } from "./pages/AgentHistoryPage";

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
      element: <AppLayout />,
      errorElement: <AppErrorPage />,
      children: [
        {
          path: "/",
          element: <Navigate to="/agent" />,
        },
        {
          path: "/agent",
          element: <FlowPage />,
        },
        {
          path: "/agent-history",
          element: <AgentHistoryPage />,
        },
        {
          path: "/agents-assist",
          element: <AgentsAssistPage />,
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
