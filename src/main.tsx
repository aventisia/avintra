import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AlertDialogWrapper } from "@aventisia/ui/alert-dialog";
import { TooltipProvider } from "@aventisia/ui/tooltip";
import { SonnerToaster } from "@aventisia/ui/sonner";

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
