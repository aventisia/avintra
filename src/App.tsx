import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { MLModelBuilderLayout } from "./components/layout/Layout";

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
      element: <MLModelBuilderLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Navigate to="/model-library" />,
        },
        {
          path: "/model-library",
          element: <h1>Model Library </h1>,
        },
        {
          path: "/label-data",
          element: <h1>Label Data </h1>,
        },
        {
          path: "/model",
          element: <h1>Model </h1>,
        },
        {
          path: "/test",
          element: <h1>Test</h1>,
        },
        {
          path: "/settings",
          element: <h1>Settings</h1>,
        },
        {
          path: "/support",
          element: <h1>Support</h1>,
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
