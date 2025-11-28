// Define role priority, lower number means higher priority
const rolePriority = {
  SA: 1, // Highest priority
  TA: 2,
  OM: 3,
  TD: 4,
  TU: 5, // Lower priority
};

// Helper function to get the dominant role from the user's roles
const getDominantRole = (roles: string[]) => {
  // Sort roles based on their priority (higher priority = lower value)
  roles.sort(
    (a, b) =>
      (rolePriority[a as keyof typeof rolePriority] || Infinity) -
      (rolePriority[b as keyof typeof rolePriority] || Infinity),
  );
  return roles[0]; // Return the role with the highest priority
};

// Helper function to determine the route based on the dominant role
export const getRouteForRole = (roles: string[]) => {
  const dominantRole = getDominantRole(roles);
  switch (dominantRole) {
    case "SA":
      return "/agents";
    case "TA":
      return "/agents";
    case "OM":
      return "/orchestrator/published-agents";
    case "TD":
      return "/agents";
    case "TU":
      return "/assist/agents";

    default:
      return "/agents"; // Default fallback route
  }
};
