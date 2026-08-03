import { AlertDialogWrapper } from "@avplatform/ui/alert-dialog";
import { SonnerToaster } from "@avplatform/ui/sonner";
import "@avplatform/ui/styles/sonner.css";
import { TooltipProvider } from "@avplatform/ui/tooltip";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

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
