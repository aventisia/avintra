const INSTANCE_DATA_QUERY_KEY = "INSTANCE_DATA";

const TABLE_HEADING = "On-prem Tenants";

const TABLE_KEY = "onPremTenantInstanceData";

const formatNumber = (num: number) =>
  num?.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export { INSTANCE_DATA_QUERY_KEY, TABLE_HEADING, TABLE_KEY, formatNumber };
