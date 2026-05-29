import { Separator, Skeleton } from "@/app/_components/ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/app/_components/ui/cards";

/**
 * TemplateCardSkeleton
 *
 * Placeholder skeleton UI shown while template data is loading.
 * Mimics the structure of the TemplateCard for a seamless UX.
 */
export const TemplateCardSkeleton = () => {
  return (
    <Card className="cursor-pointer rounded-2xl border-primary-50 shadow-none ">
      <CardHeader className="space-y-4 pb-4">
        {/* Icon placeholder */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg bg-accent" />
        </div>

        {/* Title and description placeholders */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>

      <CardContent className="space-y-3 pb-1">
        {/* Type badge placeholder */}
        <Skeleton className="h-6 w-1/4" />
        <Separator />
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {/* Creator and usage count placeholders */}
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-12" />
      </CardFooter>
    </Card>
  );
};
