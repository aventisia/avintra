import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { AlertDialogWrapper } from "@/react-toolkit/ui/alert-dialog/AlertDialogWrapper";
import { SonnerToaster } from "@/react-toolkit/ui/sonner/SonnerToaster";
import { TooltipProvider } from "@/react-toolkit/ui/Tooltip";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
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
