import { LoadingSpinner } from "@avplatform/ui";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Navigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

type PlanType = "Starter" | "Pro" | "Enterprise" | "Commercial";

interface ProtectedRouteProps {
  persmissions: string[]; // Optional prop for permissions
  planTypes?: PlanType[]; // Optional: Allowed plan types
  page: React.ReactNode; // Optional prop for children components
}

const ProtectedRoute = ({ persmissions, planTypes, page }: ProtectedRouteProps) => {
  const location = useLocation();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  if (!userSession) {
    return <LoadingSpinner className="h-8 w-8" />;
  }

  // Get user roles from the session
  const userRoles = userSession?.userRoles ?? [];
  const userPlanType = userSession?.planType as PlanType;

  // Check if the user has any of the required permissions
  const hasPermission = persmissions.some((permission) => userRoles.includes(permission));

  const isPlanAllowed =
    !planTypes || // if no plan restrictions, allow by default
    planTypes.includes(userPlanType);

  if (!hasPermission || !isPlanAllowed) {
    return <Navigate to="/page-not-found" state={{ from: location }} replace />;
  }

  return page;
};

export { ProtectedRoute };
