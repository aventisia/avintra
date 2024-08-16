import { CursorArrowRippleIcon } from "@heroicons/react/24/solid";

const IconContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-100">
      {children}
    </div>
  );
};

const ManualTriggerIcon = () => {
  return (
    <IconContainer>
      <CursorArrowRippleIcon className="h-4 w-4 stroke-[2.5] text-indigo-600" />
    </IconContainer>
  );
};

export { ManualTriggerIcon };
