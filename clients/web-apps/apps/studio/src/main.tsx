import { AlertDialogWrapper } from "@avplatform/ui/alert-dialog";
import { bootstrapBranding } from "@avplatform/ui/branding";
import { SonnerToaster } from "@avplatform/ui/sonner";
import { initTheme } from "@avplatform/ui/stores";
import "@avplatform/ui/styles/sonner.css";
import { TooltipProvider } from "@avplatform/ui/tooltip";
import { IconContext } from "@phosphor-icons/react";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

initTheme();

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <IconContext.Provider value={{ size: 24 }}>
        <TooltipProvider>
          {/* Alert dialog wrapper */}
          <AlertDialogWrapper>
            <App />
          </AlertDialogWrapper>

          {/* To show toaster notifications */}
          <SonnerToaster />
        </TooltipProvider>
      </IconContext.Provider>
    </React.StrictMode>,
  );
};

// Apply deployment branding before the first render so the app never flashes the default
// theme values. The wait is bounded by BRANDING_BOOT_TIMEOUT; a slower response falls back to
// the built-in defaults and re-themes once it arrives.
void bootstrapBranding()
  .catch(() => undefined)
  .finally(renderApp);
