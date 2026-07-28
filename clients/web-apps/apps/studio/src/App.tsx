import { NotFoundPage } from "@avplatform/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import { AppErrorPage } from "./components/layout/AppErrorPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRedirectPage } from "./components/layout/AppRedirectPage";
import { AgentHistoryPage } from "./pages/AgentHistoryPage";
import { ExecutionLogsPage } from "./pages/ExecutionLogsPage";
import { FlowPage } from "./pages/FlowPage";

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
          path: "/execution-log",
          element: <ExecutionLogsPage />,
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
