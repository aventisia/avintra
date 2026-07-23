export interface ExportChartDTO {
  serviceType: string[];
  users: string[];
  agents: string[];
  startDate: Date | null;
  endDate: Date | null;
}
