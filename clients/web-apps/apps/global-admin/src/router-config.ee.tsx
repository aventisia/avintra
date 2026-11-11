import { NotFoundPage } from "@avplatform/layout";
import { Navigate, type RouteObject, createBrowserRouter } from "react-router-dom";

import { GlobalAdminLayout } from "./components/layout/GlobalAdminLayout.ee";
import { OnPremTenantsPage } from "./pages/OnPremTenantsPage.ee";
import { TenantInstanceDataPage } from "./pages/TenantInstanceDataPage.ee";
import { TenantInstancePage } from "./pages/TenantInstancePage.ee";

const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <GlobalAdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/on-prem-tenants" replace />,
      },
      {
        path: "/on-prem-tenants",
        children: [
          {
            index: true,
            element: <OnPremTenantsPage />,
          },
          {
            path: ":tid",
            children: [
              {
                index: true,
                element: <TenantInstancePage />,
              },
              {
                path: ":id",
                element: <TenantInstanceDataPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routerConfig, {
  basename: import.meta.env.BASE_URL,
});
