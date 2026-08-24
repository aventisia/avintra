import { Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@avplatform/ui/cards";
import { ArrowRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

interface AtlasApp {
  title: string;
  description: string;
  route: string;
  icon: string;
  /** When true, the card is shown in a disabled "Coming Soon" state. */
  comingSoon?: boolean;
}

/**
 * The list of Avintra applications surfaced on the Atlas home grid.
 *
 * - `Avintra Agents` redirects to the Workspace app.
 * - Cards marked `comingSoon` are shown disabled for now.
 */
const atlasApps: AtlasApp[] = [
  {
    title: "Avintra Agents",
    description: "Build, orchestrate and manage your AI agents.",
    route: import.meta.env.VITE_WORKSPACE_PATH,
    icon: "GenerativeModel.svg",
  },
  {
    title: "Avintra Sales",
    description: "Track pipelines, deals and sales performance.",
    route: "/sales",
    icon: "DataTable.svg",
  },
  {
    title: "Avintra Projects",
    description: "Plan, execute and monitor your projects.",
    route: "/projects",
    icon: "Folder.svg",
  },
  {
    title: "Avintra HR",
    description: "Manage people, hiring and employee records.",
    route: "/hr",
    icon: "System.svg",
  },
  {
    title: "Avintra Legal",
    description: "Centralise contracts, matters and compliance.",
    route: "/legal",
    icon: "File.svg",
    comingSoon: true,
  },
  {
    title: "Avintra Operations",
    description: "Streamline workflows and daily operations.",
    route: "/operations",
    icon: "Workstation.svg",
    comingSoon: true,
  },
  {
    title: "Avintra Finance",
    description: "Manage budgets, expenses and financial reporting.",
    route: "/finance",
    icon: "Clipboard.svg",
    comingSoon: true,
  },
  {
    title: "Avintra Apps",
    description: "Discover and manage your Avintra applications.",
    route: "/apps",
    icon: "BlockNodeIcon.svg",
    comingSoon: true,
  },
];

export const HomePage = () => {
  const basePath = import.meta.env.BASE_URL;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-4 md:p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Avintra</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your launchpad for the Avintra suite of applications.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {atlasApps.map((app) => {
          const isComingSoon = app.comingSoon;

          // Coming soon cards are rendered as disabled, non-clickable cards.
          if (isComingSoon) {
            return (
              <div
                key={app.route}
                className="group cursor-not-allowed focus:outline-none"
                aria-disabled="true"
              >
                <Card className="flex h-full flex-col justify-between rounded-2xl border-primary-50 bg-muted/40 opacity-60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-accent p-2 md:p-2.5">
                        <img
                          src={basePath + "assets/" + app.icon}
                          alt={app.title}
                          className="h-9 w-9 grayscale"
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-2xs font-medium"
                      >
                        <LockClosedIcon className="h-3 w-3" />
                        Coming Soon
                      </Badge>
                    </div>
                  </CardHeader>
                  <div>
                    <CardContent className="space-y-3 pb-1">
                      <CardTitle
                        title={app.title}
                        className="truncate text-[0.9rem] font-semibold capitalize"
                      >
                        {app.title}
                      </CardTitle>
                      <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {app.description}
                      </p>
                    </CardContent>
                    <Separator className="mx-4 mb-3 mt-2.5 h-[0.5px] w-auto" />

                    <CardFooter className="flex items-center justify-end !pb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              </div>
            );
          }

          return (
            <Link key={app.route} to={app.route} className="group focus:outline-none">
              <Card className="flex h-full cursor-pointer flex-col justify-between rounded-2xl border-primary-50 shadow-none transition-all hover:border-primary-200 hover:bg-slate-50">
                <CardHeader className="pb-4">
                  <div className="rounded-lg bg-accent p-2 md:p-2.5">
                    <img src={basePath + "assets/" + app.icon} alt={app.title} className="h-9 w-9" />
                  </div>
                </CardHeader>
                <div>
                  <CardContent className="space-y-3 pb-1">
                    <CardTitle
                      title={app.title}
                      className="truncate text-[0.9rem] font-semibold capitalize"
                    >
                      {app.title}
                    </CardTitle>
                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {app.description}
                    </p>
                  </CardContent>
                  <Separator className="mx-4 mb-3 mt-2.5 h-[0.5px] w-auto" />

                  <CardFooter className="flex items-center justify-end !pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRightIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardFooter>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
