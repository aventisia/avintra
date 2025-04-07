import IEnumerable from "linq";
import { BsDot } from "react-icons/bs";
import { GiWallet } from "react-icons/gi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { PiCertificate } from "react-icons/pi";
import { TbDatabaseDollar } from "react-icons/tb";

import { DeploymentTypeEnum } from "@/react-toolkit/enums/deployment-types-enum";
import { PricingUnitTypesEnum } from "@/react-toolkit/enums/pricing-unit-types-enum";
import { StatsCard } from "@/react-toolkit/ui/card/StatsCard";
import { useQueryClient } from "@tanstack/react-query";

import { DATA_QUERY_KEY } from "../constants";
import { LicensesTableDto } from "../dtos/sa-licenses-table-dto";

type LicensesStats = {
  dediacted: number;
  onprem: number;
  shared: number;

  totalLicenses: number;
  allocatedLicenses: number;
  consumedLicenses: number;
  availableLicenses: number;

  totalCredits: number;
  allocatedCredits: number;
  consumedCredits: number;
  availableCredits: number;

  annualRevenue: number;
  totalOverdue: number;
};

export const SaLicensesStats = () => {
  const queryClient = useQueryClient();

  const licensesData = queryClient.getQueryData<{
    data: LicensesTableDto[];
  }>(DATA_QUERY_KEY);

  const statsData = IEnumerable.from<LicensesTableDto>(
    licensesData?.data ?? [],
  );

  const stats: LicensesStats = {
    dediacted: statsData.count(
      (x) => x.tenantType == DeploymentTypeEnum.Dedicated,
    ),
    onprem: statsData.count((x) => x.tenantType === DeploymentTypeEnum.OnPrem),
    shared: statsData.count((x) => x.tenantType === DeploymentTypeEnum.Shared),

    totalLicenses: statsData.count(
      (x) => x.unit === PricingUnitTypesEnum.License,
    ),
    allocatedLicenses: statsData.sum((x) => x.allocated),
    consumedLicenses: statsData.sum((x) => x.consumed),
    availableLicenses: statsData.sum((x) => x.available),

    totalCredits: statsData.count(
      (x) => x.unit === PricingUnitTypesEnum.Credit,
    ),
    allocatedCredits: statsData.sum((x) => x.available),
    consumedCredits: statsData.sum((x) => x.consumed),
    availableCredits: statsData.sum((x) => x.available),

    annualRevenue: statsData.sum((x) => x.unitPrice),
    totalOverdue: statsData.sum((x) => x.overdueBalance),
  };

  return (
    <div className="my-4 grid grid-cols-4 gap-10 gap-x-8">
      <StatsCard
        title={"Total Tenants"}
        description={
          <span className="flex items-center text-pretty text-center">
            <p>
              <span className="font-semibold">{stats.dediacted}</span> Dedicated
            </p>
            <BsDot strokeWidth={4} />
            <p>
              <span className="font-semibold">{stats.onprem}</span> On-prem
            </p>
            <BsDot strokeWidth={4} />

            <p>
              <span className="font-semibold">{stats.shared}</span> Shared
            </p>
          </span>
        }
        mainText={statsData.count()}
        icon={
          <HiOutlineBuildingOffice2
            stroke="var(--primary)"
            className="h-10 w-10"
          />
        }
      />
      <StatsCard
        title={"Licenses"}
        description={
          <span className="flex items-center">
            <p>
              <span className="font-semibold">{stats.consumedLicenses}</span>{" "}
              Consumed
            </p>
            <BsDot strokeWidth={4} />

            <p>
              <span className="font-semibold">{stats.allocatedLicenses}</span>{" "}
              Allocated
            </p>
            <BsDot strokeWidth={4} />

            <p>
              <span className="font-semibold">{stats.availableLicenses}</span>{" "}
              Available
            </p>
          </span>
        }
        mainText={stats.totalLicenses}
        icon={<PiCertificate fill="var(--primary)" className="h-10 w-10" />}
      />
      <StatsCard
        title={"Credits"}
        description={
          <span className="flex items-center">
            <p>
              <span className="font-semibold">{stats.consumedCredits}</span>{" "}
              Consumed
            </p>
            <BsDot strokeWidth={4} />

            <p>
              <span className="font-semibold">{stats.allocatedCredits}</span>{" "}
              Allocated
            </p>
            <BsDot strokeWidth={4} />

            <p>
              <span className="font-semibold">{stats.availableCredits}</span>{" "}
              Available
            </p>
          </span>
        }
        mainText={stats.totalCredits}
        icon={
          <TbDatabaseDollar stroke="var(--primary)" className="h-10 w-10" />
        }
      />

      <StatsCard
        title={"Annaul Revenue"}
        description={
          <p
            className={
              stats.totalOverdue ? "text-destructive" : "text-green-700"
            }
          >
            {stats.totalOverdue} Overdue
          </p>
        }
        mainText={stats.annualRevenue}
        icon={<GiWallet fill="var(--primary)" className="h-10 w-10" />}
      />
    </div>
  );
};
