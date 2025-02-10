import { createContext } from "react";
import { twMerge } from "tailwind-merge";

type InputGroupProps = React.PropsWithChildren &
  React.ComponentPropsWithoutRef<"div">;

export const inputGroupContext = createContext(false);

function InputGroup(props: InputGroupProps) {
  return (
    <inputGroupContext.Provider value={true}>
      <div {...props} className={twMerge(["flex", props.className])}>
        {props.children}
      </div>
    </inputGroupContext.Provider>
  );
}

type TextProps = React.PropsWithChildren &
  React.ComponentPropsWithoutRef<"div">;

InputGroup.Text = (props: TextProps) => {
  // const inputGroup = useContext(inputGroupContext);
  return (
    <div
      {...props}
      className={twMerge([
        "dark:bg-darkmode-900/20 border border-slate-300/60 bg-slate-100 px-3 py-2 text-slate-600 shadow-sm dark:text-slate-400",
        // inputGroup &&
        "rounded-none first:rounded-l last:rounded-r [&:not(:first-child)]:border-l-transparent",
        props.className,
      ])}
    >
      {props.children}
    </div>
  );
};

export default InputGroup;
