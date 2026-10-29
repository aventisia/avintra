interface IUsageSummary {
  totalCredits: number;
  totalExecutionCredits: number;
  totalLlmCredits: number;
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
  isExecution: boolean;
  totalCredits: number;
  usageTimeline: IGraphData[];
}

export interface IUsers {
  firstName: string;
  lastName: string;
  username: string;
  totalExecutionCredits: number;
  totalLlmCredits: number;
  totalCredits: number;
}

export interface IAgents {
  agentName: string;
  totalExecutionCredits: number;
  totalLlmCredits: number;
  totalCredits: number;
}

export interface CreditUsageDTO {
  usageSummary: IUsageSummary;
  creditUsages: IGraphData[];
  executionCreditUsages: IGraphData[];
  llmCreditUsages: IGraphData[];
  resourceUsages: IResourceUsages[];
  users: IUsers[];
  agents: IAgents[];
}
