import type { CountriesEnum } from "@avplatform/ui/enums";

/**
 * Represents a data transfer object (DTO) for a my account.
 */
export interface MyAccountDto {
  avatarSrc: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  gender: "Male" | "Female" | "PreferNotToSay";
  country: CountriesEnum;
  city: string;
  stateOrProvince: string;
  zipOrPostalCode: string;
}
