interface IGraphData {
  date: string;
  totalCount: number;
}

export interface IByokModelUsage {
  model: string;
  unitType: string;
  totalConsumption: number;
  usageTimeline: IGraphData[];
}

export interface IByokProviderUsage {
  provider: string;
  models: IByokModelUsage[];
}

export interface IByokUsers {
  firstName: string;
  lastName: string;
  username: string;
  totalConsumption: number;
}

export interface IByokAgents {
  agentName: string;
  totalConsumption: number;
}

export interface ByokUsageDTO {
  providers: IByokProviderUsage[];
  users: IByokUsers[];
  agents: IByokAgents[];
}
