import * as lucideIcons from "lucide-react";
import { twMerge } from "tailwind-merge";

export type LucidIconName = keyof typeof lucideIcons.icons;

interface LucideProps extends React.ComponentPropsWithoutRef<"svg"> {
  icon: LucidIconName;
  title?: string;
}

function Lucide(props: Readonly<LucideProps>) {
  const { icon, className, ...computedProps } = props;
  const Component = lucideIcons.icons[icon];
  return <Component {...computedProps} className={twMerge(["h-5 w-5 stroke-2", className])} />;
}

export default Lucide;
