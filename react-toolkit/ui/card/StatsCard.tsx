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
      <div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium tracking-wide">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mainText}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </CardContent>
      </div>
    </Card>
  );
};
