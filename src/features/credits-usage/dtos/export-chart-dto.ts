export interface ExportChartDTO {
    serviceType: string[];
    users: string[];
    agents: string[];
    aiModels: string[];
    startDate: Date | null;
    endDate: Date | null;
}