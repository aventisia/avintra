interface IUsageSummary {
  totalCredits: number;
  totalTransactions: number;
}

interface IGraphData {
  date: string;
  totalCredits: number;
  totalTransactions: number;
}

interface IResourceUsages {
  serviceType: string;
  unitType: string;
  oneUnit: number;
  credits: number;
  usageTimeline: IGraphData[];
}

interface IUsers {
  firstName: string;
  lastName: string;
  username: string;
  totalTransactions: number;
  totalCredits: number;
}

interface IAiModels {
  modelName: string;
  totalTransactions: number;
  totalCredits: number;
}

interface IAgents {
  agentName: string;
  totalTransactions: number;
  totalCredits: number;
}

export interface CreditUsageDTO {
  usageSummary: IUsageSummary;
  creditUsages: IGraphData[];
  transactionUsages: IGraphData[];
  resourceUsages: IResourceUsages[];
  users: IUsers[];
  aiModels: IAiModels[];
  agents: IAgents[];
}
