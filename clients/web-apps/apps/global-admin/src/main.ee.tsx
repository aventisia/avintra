import { AlertDialogWrapper } from "@avplatform/ui/alert-dialog";
import { bootstrapBranding } from "@avplatform/ui/branding";
import { SonnerToaster } from "@avplatform/ui/sonner";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import "@avplatform/ui/styles/sonner.css";
import { TooltipProvider } from "@avplatform/ui/tooltip";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.ee.tsx";
import "./index.ee.css";

useBaseLayoutStore.getState().setViteEnvVars({
  BASE_URL: import.meta.env.BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
});

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <TooltipProvider>
        <AlertDialogWrapper>
          <App />
        </AlertDialogWrapper>

        <SonnerToaster />
      </TooltipProvider>
    </React.StrictMode>,
  );
};

void bootstrapBranding()
  .catch(() => undefined)
  .finally(renderApp);
