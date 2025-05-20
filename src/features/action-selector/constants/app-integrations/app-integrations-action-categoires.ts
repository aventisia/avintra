import { ActionCategoryType } from "../../types/action-category-type";
import { emailActions } from "./email-actions";
import { exchangeServerActions } from "./exchange-server-actions";
import { ftpActions } from "./ftp-actions";
import { pdfActions } from "./pdf-actions";
import { wordActions } from "./word-actions";
import { excelActions } from "./excel-actions";
import { outlookActions } from "./outlook-actions";
import { httpActions } from "./http-actions";
import { terminalEmulationActions } from "./terminal-emulation-actions";
import { windowsServicesActions } from "./windows-services-actions";

export const appIntegrationActions: ActionCategoryType[] = [
  {
    name: "email",
    label: "Email",
    description:
      "Automate sending, receiving and managing email messages through imap/smtp",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: emailActions,
  },
  {
    name: "exchangeServer",
    label: "Exchange server",
    description:
      "Automate sending, receiving, and managing emails through Exchange",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: exchangeServerActions,
  },
  {
    name: "pdf",
    label: "PDF",
    description: "Automate PDF files and their content (text and images)",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: pdfActions,
  },
  {
    name: "terminalEmulation",
    label: "Terminal emulation",
    description:
      "Take control of terminal emulators for automating mainframes and legacy systems",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: terminalEmulationActions,
  },
  {
    name: "windowsServices",
    label: "Windows Services",
    description: "Control the workstation's installed services",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: windowsServicesActions,
  },
  {
    name: "ftp",
    label: "FTP",
    description: "Manage files and folders on an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: ftpActions,
  },
  {
    name: "word",
    label: "Word",
    description: "Automate any Word related activity",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: wordActions,
  },
  {
    name: "excel",
    label: "Excel",
    description: "Automate any excel related activity",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: excelActions,
  },
  {
    name: "outlook",
    label: "Outlook",
    description:
        "Automate sending, receiving, and managing email messages of an Outlook account",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: outlookActions,
  },
  {
    name: "http",
    label: "HTTP",
    description: "Communicate with web applications and services directly",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: httpActions,
  },
];
