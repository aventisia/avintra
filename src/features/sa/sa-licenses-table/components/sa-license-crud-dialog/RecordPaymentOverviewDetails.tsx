import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingComponentsEnum } from "@/react-toolkit/enums/pricing-components-enum";
import { currencyFormater } from "@/react-toolkit/utils/currency-formatter";

import { Skeleton } from "@aventisia/ui";
import { getEnumValueByKey } from "@aventisia/ui/utils";
import { Convert } from "easy-currencies";
import { useEffect, useState } from "react";

import { LicensesTableDto } from "../../dtos/sa-licenses-table-dto";

export const RecordPaymentOverviewDetails = ({
  details,
  isFetching = false,
}: {
  details?: LicensesTableDto;
  isFetching?: boolean;
}) => {
  // TODO add this to allow list https://api.exchangerate-api.com/v4/latest/
  const [amountInINR, setAmountInINR] = useState(0);

  useEffect(() => {
    const fetchAmount = async () => {
      const value = await Convert(details?.overdueBalance)
        .from(details?.currency ?? "")
        .to("INR");

      setAmountInINR(value);
    };
    fetchAmount();
  }, [details?.currency, details?.overdueBalance]);

  return (
    <div>
      <p className="text-md mb-2 border-b-2 pb-2">Overview</p>
      <div className="mt-4 flex flex-col gap-2 text-sm font-light">
        <OverviewDetailDivElement
          label="Tenant Type :"
          isFetching={isFetching}
          data={getEnumValueByKey(
            DeploymentTypeEnum,
            details?.tenantType ?? "",
          )}
        />
        <OverviewDetailDivElement
          label="Tenat Name :"
          isFetching={isFetching}
          data={details?.tenantName ?? "Default"}
        />
        <OverviewDetailDivElement
          label="Pricing Component :"
          isFetching={isFetching}
          data={getEnumValueByKey(
            PricingComponentsEnum,
            details?.pricingComponent ?? "",
          )}
        />
        <OverviewDetailDivElement
          label="Currency :"
          isFetching={isFetching}
          data={details?.currency}
        />
        <OverviewDetailDivElement
          label="Overdue Amount :"
          isFetching={isFetching}
          data={currencyFormater(
            details?.overdueBalance ?? 0,
            details?.currency,
          )}
        />
        <OverviewDetailDivElement
          label="Overdue Amount (in INR) :"
          isFetching={isFetching}
          data={currencyFormater(amountInINR, "INR")}
        />
      </div>
    </div>
  );
};

export const OverviewDetailDivElement = ({
  isFetching,
  data,
  label,
}: {
  isFetching: boolean;
  label: string;
  data: string | number | undefined;
}) => (
  <div className="flex justify-between">
    <p>{label}</p>
    <div className="font-medium">
      {isFetching ? <Skeleton className="h-5 w-32" /> : (data ?? "NA")}
    </div>
  </div>
);
