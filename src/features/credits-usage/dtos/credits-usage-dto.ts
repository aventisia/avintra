
interface IUsageSummary {
    totalCreditsConsumed: number;
    totalTransactionsCount: number;
}

interface IGraphData {
    date: string;
    value: number;
}

interface IResourceUsages {
    serviceType: string;
    unitType: string;
    oneUnit: number;
    credits: number;
    usageTimeline: IGraphData[];
}

// {
//     "serviceType": "SendGridEmail",
//     "unitType": "Message",
//     "oneUnit": 1,
//     "credits": 1,
//     "usageTimeline": [
//         {
//             "date": "2025-08-15T00:00:00+00:00",
//             "value": 500
//         },
//         {
//             "date": "2025-08-20T00:00:00+00:00",
//             "value": 500
//         }
//     ]
// },

interface IUsers {
    firstName: string;
    lastName: string;
    username: string;
    transactionsCount: number;
}

interface IAiModels {
    modelName: string;
    usageCount: number;
}

interface IAgents {
    agentName: string;
    usageCount: number;
}

export interface CreditUsageDTO {
    usageSummary: IUsageSummary;
    creditUsages: IGraphData[];
    transactionUsages: IGraphData[];
    resourceUsages: IResourceUsages[];
    users: IUsers[];
    aiModels: IAiModels[];
    agents: IAgents[]
}