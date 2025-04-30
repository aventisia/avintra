import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { TooltipProvider } from "@aventisia/ui/tooltip";
import { AlertDialogWrapper } from "@aventisia/ui/alert-dialog";
import { SonnerToaster } from "@aventisia/ui/sonner";

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
