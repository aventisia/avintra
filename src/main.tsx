import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { AlertDialogWrapper } from "@/react-toolkit/ui/alert-dialog/AlertDialogWrapper.tsx";
import { TooltipProvider } from "@/react-toolkit/ui/custom/Tooltip.tsx";
import { SonnerToaster } from "@/react-toolkit/ui/sonner/SonnerToaster.tsx";
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
