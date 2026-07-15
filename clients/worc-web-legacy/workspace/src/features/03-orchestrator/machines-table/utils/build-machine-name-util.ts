import { EnvironmentTypesEnum } from "@/react-toolkit/enums/machine-environment-types-enum";

const getEnvironmentToken = (environment: string) => {
  switch (environment) {
    case EnvironmentTypesEnum.Development:
      return "dev";
    case EnvironmentTypesEnum.Production:
      return "prod";
    case EnvironmentTypesEnum.UAT:
      return "uat";
    default:
      return environment.trim().toLowerCase();
  }
};

const buildMachineNamePreview = ({
  environment,
  operatingSystem,
  osID,
  username,
}: {
  environment: string;
  operatingSystem: string;
  osID: string;
  username: string;
}) => {
  const normalizedUsername = username.trim().toLowerCase();
  const environmentToken = getEnvironmentToken(environment);
  const osToken = operatingSystem.trim().toLowerCase();
  const normalizedOsId = osID.trim().toLowerCase();

  return `[${normalizedUsername.length > 0 ? normalizedUsername : "username"}]_${environmentToken}_${osToken}_${normalizedOsId.length > 0 ? normalizedOsId : "os-unique-id"}`;
};

export { buildMachineNamePreview };
