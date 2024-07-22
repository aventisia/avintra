import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { AlertDialog, ToasterExt } from "@/react-toolkit/components/ui";
import "@/react-toolkit/styles/react-perfect-scrollbar.css";
import { ConfirmActionAlert } from "@/react-toolkit/components/ui/custom/ConfirmActionAlert.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider>
      {/* Alert dialog provider */}
      <AlertDialog>
        {/* Main app */}
        <App />

        {/* Custom alert dialog for confirm action */}
        <ConfirmActionAlert />
      </AlertDialog>

      {/* To show toaster notifications */}
      <ToasterExt />
    </TooltipProvider>
  </React.StrictMode>,
);
