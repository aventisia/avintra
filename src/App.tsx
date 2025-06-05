import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundPage } from "@/react-toolkit/pages/NotFoundPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import { MLModelBuilderLayout } from "./components/layout/MLModelBuilderLayout";
import { FineTunePage } from "./pages/FineTunePage";
import { LabelDataPage } from "./pages/LabelDataPage";
import { PreviewFilePage } from "./pages/PreveiwFilePage";
import { RunReivewPage } from "./pages/RunReivewPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MLModelBuilderLayout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <Navigate to="/setup-test" /> },
        { path: "/setup-test", element: <LabelDataPage /> },
        { path: "/run-review", element: <RunReivewPage /> },
        { path: "/preview", element: <PreviewFilePage /> },
        { path: "/fine-tune", element: <FineTunePage /> },

        { path: "/*", element: <NotFoundPage /> },
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
