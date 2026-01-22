import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import { IS_TAURI } from "./constants/constants";
import { AppUpdateToast } from "./features/tauri-updater/components/AppUpdateToast";
import { router } from "./router-config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {IS_TAURI ? <AppUpdateToast domain={window.location.origin} /> : null}
    </QueryClientProvider>
  );
}
