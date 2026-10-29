export const ADD_ON_PRICING = {
  spaces: {
    unitCost: {
      monthly: 0.5, // $0.5 per space per month
      yearly: 5, // $5 per space per year
    },
    label: "Spaces",
    note: {
      monthly: "$0.5 = 1 space/month",
      yearly: "$5 = 1 space/year",
    },
    step: 1,
  },
  storage: {
    unitCost: {
      monthly: 0.1 / 100, // $0.1 = 100MB per month
      yearly: 1 / 100, // $1 = 100MB per year
    },
    label: "Storage",
    note: {
      monthly: "$0.1 = 100 MB/month",
      yearly: "$1 = 100 MB/year",
    },
    step: 100,
  },
  history: {
    unitCost: {
      monthly: 5 / 30, // $5 = 30 days, convert to daily rate
      yearly: 5 / 30,
    },
    label: "Insights and history",
    note: {
      monthly: "$5 = 30 days",
      yearly: "$5 = 30 days",
    },
    step: 30,
  },
};
