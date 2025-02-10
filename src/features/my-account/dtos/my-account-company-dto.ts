import type { CountriesEnum } from "@/react-toolkit/enums/countries-enum";

/**
 * Represents a data transfer object (DTO) for a my account.
 */
export interface CompanyDto {
  userId: string;
  companyType: "Individual" | "Company";
  companyName: string;
  role: string;
  addressLine1: string;
  addressLine2: string;
  country: CountriesEnum;
  stateOrProvince: string;
  city: string;
  ZipOrPostalCode: string;
}
