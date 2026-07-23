import { AlertDialogWrapper } from "@avplatform/ui/alert-dialog";
import { SonnerToaster } from "@avplatform/ui/sonner";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import "@avplatform/ui/styles/sonner.css";
import { TooltipProvider } from "@avplatform/ui/tooltip";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import "./slide-animation.css";

// Initialize shared layout store with environment variables used by @avplatform/ui hooks/components.
useBaseLayoutStore.getState().setViteEnvVars({
  BASE_URL: import.meta.env.BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      {/* Alert dialog wrapper */}
      <AlertDialogWrapper>
        <App />
      </AlertDialogWrapper>

      {/* To show toaster notifications */}
      <SonnerToaster />
    </TooltipProvider>
  </React.StrictMode>,
);
