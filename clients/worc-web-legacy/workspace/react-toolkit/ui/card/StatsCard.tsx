import { Card, CardContent, CardHeader, CardTitle } from "@aventisia/ui/cards";
import { twMerge } from "tailwind-merge";

type StatsCardProps = {
  icon: JSX.Element;
  iconContainerClassName?: string;
  title: JSX.Element | string;
  mainText: JSX.Element | string | number;
  description?: JSX.Element | string;
};
export const StatsCard = ({
  icon,
  title,
  mainText,
  description,
  iconContainerClassName,
}: StatsCardProps) => {
  return (
    <Card className="flex flex-row items-center rounded-md">
      <div
        className={twMerge(
          "ms-5 rounded-md bg-primary-50 p-4 shadow-primary-100",
          iconContainerClassName,
        )}
      >
        {icon}
      </div>
      <div className="-mb-1.5">
        <CardHeader className="flex pt-4 pb-0 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium tracking-wide">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{mainText}</div>
          <div className="text-2xs text-muted-foreground">{description}</div>
        </CardContent>
      </div>
    </Card>
  );
};
