import AccountsAppLogo from "@/components/layout/AccountsAppLogo";
import { AccountsUILayout } from "@/components/layout/AccountsUILayout";
import { ErrorPage } from "@/react-toolkit/pages/ErrorPage";
import { NotFoundWithLayoutPage } from "@/react-toolkit/pages/NotFoundWithLayoutPage";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Lazy load pages
const CreateAccountPage = lazy(() => import("@/pages/CreateAccountPage"));
const LogInPage = lazy(() => import("@/pages/LogInPage"));
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
      errorElement: <ErrorPage appLogo={<AccountsAppLogo />} />,
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
          path: "/create-account",
          element: <CreateAccountPage />,
        },
        {
          path: "/reset-pwd",
          element: <ResetPwdPage />,
        },
        {
          path: "/page-not-found",
          element: <NotFoundWithLayoutPage appLogo={<AccountsAppLogo />} />,
        },
        {
          path: "/*",
          element: <NotFoundWithLayoutPage appLogo={<AccountsAppLogo />} />,
        },
      ],
    },
    {
      path: "/redirect",
      element: <RedirectPage appLogo={<AccountsAppLogo />} />,
      errorElement: <ErrorPage appLogo={<AccountsAppLogo />} />,
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
