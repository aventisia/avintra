import { LoadingSpinner } from "@aventisia/ui";
import { Navigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

interface ProtectedRouteProps {
  persmissions: string[]; // Optional prop for permissions
  page: React.ReactNode; // Optional prop for children components
}

const ProtectedRoute = ({ persmissions, page }: ProtectedRouteProps) => {
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

  // Check if the user has any of the required permissions
  const hasPermission = persmissions.some((permission) =>
    userRoles.includes(permission),
  );

  if (!hasPermission) {
    return <Navigate to="/page-not-found" state={{ from: location }} replace />;
  }

  return page;
};

export { ProtectedRoute };
