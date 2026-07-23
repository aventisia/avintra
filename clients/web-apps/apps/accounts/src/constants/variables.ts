/**
 * A constant string representing an message which user will get from backend when 2FA is enabled.
 * Any change to the backend error message should be reflected here.
 */
const TWO_FA_ENABLED = "TwoFA is enabled";

/**
 * A constant string representing an message which user will get from backend when password is expired.
 * Any change to the backend error message should be reflected here.
 */
const PWD_EXPIRED = "Your password has been expired";

/**
 * A constant string representing a message which the user will receive from the backend when tenant setup is incomplete.
 * This message is shown after user signup or account creation, until company (tenant) details are completed.
 * Any change to the backend message should be reflected here.
 */
const ADD_TENANT = "Complete organization setup to continue.";

/**
 * A constant string representing a message which the user will receive from the backend when no active subscription (plan) is found.
 * This is used to check if the tenant has a valid plan associated with the account.
 * Any change to the backend message should be reflected here.
 */
const NO_ACTIVE_SUBSCRIPTION = "Tenant has no active subscription.";

/**
 * Local storage key for storing the billing info form data.
 */
const BILLING_INFO_KEY = "billingInfo";

export { TWO_FA_ENABLED, PWD_EXPIRED, ADD_TENANT, NO_ACTIVE_SUBSCRIPTION, BILLING_INFO_KEY };
