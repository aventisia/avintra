export const TICKET_TABLE_KEY = "support-tickets-v2";
export const TICKET_TABLE_HEADING = "Support Tickets";

export const REQUEST_TYPES = [
  { value: "ServiceRequest", label: "Service Request" },
  { value: "ChangeRequest", label: "Change Request" },
] as const;

export const TICKET_STATUSES = [
  { value: "New", label: "New" },
  { value: "InProgress", label: "In Progress" },
  { value: "Closed", label: "Closed" },
] as const;

export const COMPLEXITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
] as const;

export const RISK_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
] as const;

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// TODO: We need to set the color for each status in the html to avoid tailwind css purging the unused classes
export const TICKET_STATUS_COLOR: Record<string, string> = {
  New: "bg-slate-200 text-slate-600",
  InProgress: "bg-green-200 text-green-700",
  Closed: "bg-red-200 text-red-600",
};
