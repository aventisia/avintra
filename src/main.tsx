import { AlertDialogWrapper } from "@aventisia/ui/alert-dialog";
import { SonnerToaster } from "@aventisia/ui/sonner";
import "@aventisia/ui/styles/sonner.css";
import { TooltipProvider } from "@aventisia/ui/tooltip";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      {/* Alert dialog wrapper */}
      <AlertDialogWrapper>
        <App />
      </AlertDialogWrapper>

      {/* To show toaster notifications */}
      <SonnerToaster />
    </TooltipProvider>
  </StrictMode>,
);
