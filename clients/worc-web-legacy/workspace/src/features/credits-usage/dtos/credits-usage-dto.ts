interface IUsageSummary {
  totalCredits: number;
  totalAgentTransactions: number;
  totalAgentCredits: number;
}

interface IGraphData {
  date: string;
  totalCount: number;
}

export interface IResourceUsages {
  serviceType: string;
  unitType: string;
  oneUnit: number;
  credits: number;
  totalTransactions: number;
  totalCredits: number;
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
  agentCreditUsages: IGraphData[];
  agentTransactionUsages: IGraphData[];
  resourceUsages: IResourceUsages[];
  users: IUsers[];
  aiModels: IAiModels[];
  agents: IAgents[];
}
