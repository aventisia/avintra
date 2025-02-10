import type { CountriesEnum } from "@/react-toolkit/enums/countries-enum";

/**
 * Represents a data transfer object (DTO) for a my account.
 */
export interface MyAccountDto {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "PreferNotToSay";
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  country: CountriesEnum;
  stateOrProvince: string;
  city: string;
  ZipOrPostalCode: string;
}
