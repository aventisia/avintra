import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import { AccountsUILayout } from "@/components/layout/AccountsUILayout";
import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundWithLayoutPage } from "@/react-toolkit/pages/NotFoundWithLayoutPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

// Lazy load pages
const CreateAccountPage = lazy(() => import("@/pages/CreateAccountPage"));
const OnBoardingPage = lazy(() => import("@/pages/OnBoardingPage"));
const LogInPage = lazy(() => import("@/pages/LogInPage"));
const SsoRedirectPage = lazy(() => import("@/pages/SsoRedirectPage"));
const ResetPwdPage = lazy(() => import("@/pages/ResetPwdPage"));

// Create a new query client
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
      element: <AccountsUILayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Navigate to="/login" />,
        },
        {
          path: "/login",
          element: <LogInPage />,
        },
        {
          path: "/sso-redirect",
          element: <SsoRedirectPage />,
        },
        {
          path: "/create-account",
          element: <CreateAccountPage />,
        },
        {
          path: "/onboarding",
          element: <OnBoardingPage />,
        },

        {
          path: "/reset-pwd",
          element: <ResetPwdPage />,
        },
        {
          path: "/page-not-found",
          element: <NotFoundWithLayoutPage />,
        },
        {
          path: "/*",
          element: <NotFoundWithLayoutPage />,
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
