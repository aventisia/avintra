import { BILLING_INFO_KEY } from "@/constants/variables";

import type { PlanFrequency } from "../types/plan-type";

function displayValue(value: number) {
  if (value === -1) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString();
}
function getCreditsLabel(maxCredits: number, planFrequency: PlanFrequency): string {
  const timeUnit = planFrequency === "monthly" ? "month" : "year";

  const creditLabel = maxCredits === 1 ? "credit" : "credits";

  return `${displayValue(maxCredits)} ${creditLabel} per ${timeUnit}`;
}

const getParsedBillingFromStorage = (tenantId?: string) => {
  if (!tenantId) {
    return {}; // Return empty object if tenantId is not provided or is empty
  }

  if (typeof window === "undefined") return {}; // Ensure we're on the client side

  try {
    const raw = localStorage.getItem(BILLING_INFO_KEY);

    if (!raw) return {}; // If no data in localStorage, return empty object

    const allTenantData = JSON.parse(raw);

    // Find the tenant's data based on tenantId
    const tenantData = allTenantData.find(
      (data: { tenantId: string }) => data.tenantId === tenantId,
    );

    // If tenant data is found, return it; otherwise, return empty object
    return tenantData ? tenantData.formData : {};
  } catch (error) {
    console.log("Invalid billing data in localStorage", error);
    return {}; // Return an empty object on error
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setBillingDataInStorage = (tenantId?: string, formData?: any) => {
  if (!tenantId || !formData) {
    return; // Don't proceed if tenantId is invalid
  }

  if (typeof window === "undefined") return; // Ensure we're on the client side

  try {
    const raw = localStorage.getItem(BILLING_INFO_KEY);
    let allTenantData = [];

    // If there is existing data, parse it; otherwise, start with an empty array
    if (raw) {
      allTenantData = JSON.parse(raw);
    }

    // Check if the tenant already exists
    const tenantIndex = allTenantData.findIndex(
      (data: { tenantId: string }) => data.tenantId === tenantId,
    );

    if (tenantIndex !== -1) {
      // If tenant data exists, update the formData
      allTenantData[tenantIndex].formData = {
        ...allTenantData[tenantIndex].formData,
        ...formData,
      };
    } else {
      // If tenant data does not exist, add a new entry for this tenant
      allTenantData.push({ tenantId, formData });
    }

    // Save the updated array back to localStorage
    localStorage.setItem(BILLING_INFO_KEY, JSON.stringify(allTenantData));
  } catch (error) {
    console.warn("Error saving billing data to localStorage", error);
  }
};

const isIndividualTenant = (userSession: { tenantType?: string } | null | undefined) =>
  userSession?.tenantType === "Individual";

export {
  getCreditsLabel,
  displayValue,
  getParsedBillingFromStorage,
  isIndividualTenant,
  setBillingDataInStorage,
};
