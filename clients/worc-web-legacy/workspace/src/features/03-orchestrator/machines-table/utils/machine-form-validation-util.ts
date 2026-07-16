import { uuidv4Regex } from "@aventisia/ui/utils";

import { OsTypesEnum } from "@/react-toolkit/enums/os-types-enum";

/**
 * Checks 32-character lowercase hexadecimal machine-id for Linux OS Unique ID.
 */
const linuxOsIdRegex = /^[0-9a-f]{32}$/;

/**
 * Returns the error message for an invalid OS Unique ID based on the operating system.
 */
const getOsIdError = (operatingSystem: string) => {
  switch (operatingSystem) {
    case OsTypesEnum.Windows:
      return "Windows OS Unique ID must be a valid UUIDv4.";
    case OsTypesEnum.Linux:
      return "Linux OS Unique ID must be a 32-character lowercase hexadecimal machine-id.";
    default:
      return "OS Unique ID format is invalid.";
  }
};

/**
 * Validates the OS Unique ID based on the operating system.
 */
const isValidMachineOsId = (operatingSystem: string, osID: string) => {
  switch (operatingSystem) {
    case OsTypesEnum.Windows:
      return uuidv4Regex.test(osID);
    case OsTypesEnum.Linux:
      return linuxOsIdRegex.test(osID);
    default:
      return false;
  }
};

export { getOsIdError, isValidMachineOsId };
