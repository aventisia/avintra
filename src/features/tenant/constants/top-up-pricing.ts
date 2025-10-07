export const TOP_UP_PRICING = {
  credits: {
    unitCost: 1 / 500, // $1 = 500 credits → $0.002 per credit
    label: "Credits",
    note: "$1 = 500 credits",
  },
  spaces: {
    unitCost: 5, // $5 = 1 space/year
    label: "Spaces",
    note: "$5 = 1 space/year",
  },
  storage: {
    unitCost: 1 / 100, // $1 = 100MB/year → $0.01 per MB
    label: "Storage",
    note: "$1 = 100 MB/year",
  },
  history: {
    unitCost: 5 / 30, // $5 = 30 days → $0.1667 per day
    label: "Insights and History",
    note: "$5 = 30 days",
  },
};
