/**
 * Represents a data transfer object (DTO) for a license.
 */
export interface RequestLicensesDto {
  id: string;
  planId: string;
  additionalUnitsRequested: string;
}
