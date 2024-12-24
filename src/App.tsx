import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { StudioUILayout } from "./components/layout/StudioUILayout";
import { FlowPage } from "./pages/FlowPage";
import { LogsPage } from "./pages/LogsPage";

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
      element: <StudioUILayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Navigate to="/flow" />,
        },
        {
          path: "/flow",
          element: <FlowPage />,
        },
        { path: "/flow-logs", element: <LogsPage /> },
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
