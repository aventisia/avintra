import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { cn } from "@avplatform/ui/lib";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { useNavTrail } from "./useNavTrail";

/** Breadcrumbs for the current page, built from the sidebar menu. */
const HeaderBreadcrumbs = ({ className }: { className?: string }) => {
  const trail = useNavTrail();
  if (!trail.length) return null;

  return (
    <Breadcrumb className={cn("hidden min-w-0 md:block", className)}>
      <BreadcrumbList className="flex-nowrap text-body-sm text-muted-foreground">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={`${crumb.name}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate">{crumb.name}</BreadcrumbPage>
                ) : crumb.route ? (
                  <BreadcrumbLink asChild className="truncate">
                    <Link to={crumb.route}>{crumb.name}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="truncate">{crumb.name}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export { HeaderBreadcrumbs };
