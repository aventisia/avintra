import { Navigate } from "react-router-dom";

import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { getRouteForRole } from "@/utils/get-landing-url";

export const LandingRedirect = () => {
  // Validate the user session and get the user roles
  const { isPending, userSession } = useValidateUserSession();

  // Return if session is still validating or user roles are not available
  if (isPending || !userSession?.userRoles?.length) {
    return <></>;
  }

  // Get and prioritize the user's roles for consistent matching
  const userRoles = userSession?.userRoles;

  // Get the route based on the dominant role
  const redirectTo = getRouteForRole(userRoles);

  return <Navigate to={redirectTo} replace />; // Redirect to the appropriate route
};
