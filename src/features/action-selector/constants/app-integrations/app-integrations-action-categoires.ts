import { ActionCategoryType } from "../../types/action-category-type";
import { cryptographyActions } from "./cryptography-actions";
import { databaseActions } from "./database-actions";
import { emailActions } from "./email-actions";
import { exchangeServerActions } from "./exchange-server-actions";
import { ftpActions } from "./ftp-actions";
import { ocrActions } from "./ocr-actions";
import { pdfActions } from "./pdf-actions";
import { terminalEmulationActions } from "./terminal-emulation-actions";
import { windowsServicesActions } from "./windows-services-actions";

export const appIntegrationActions: ActionCategoryType[] = [
  {
    name: "database",
    label: "Database",
    description: "Connect to databases and execute SQL statements",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: databaseActions,
  },
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
    name: "ocr",
    label: "OCR",
    description: "Initiate OCR engines to perform OCR related activities",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: ocrActions,
  },
  {
    name: "cryptography",
    label: "Cryptography",
    description: "Encrypt and decrypt text and files",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: cryptographyActions,
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
];
