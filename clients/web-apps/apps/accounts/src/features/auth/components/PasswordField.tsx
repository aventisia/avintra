import { Input } from "@avplatform/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { type FieldPath, type FieldValues, useFormContext, useWatch } from "react-hook-form";

import { PWD_RULES } from "../constants/pwd-rules";

type PasswordFieldProps = {
  name: FieldPath<FieldValues>;
  label: string;
  autoComplete: "current-password" | "new-password";

  /** A quiet action on the label row, such as "Forgot password?" */
  labelAction?: React.ReactNode;

  /** Lists the password rules under the field and ticks each one as it is met */
  showRules?: boolean;

  autoFocus?: boolean;

  /** The account email, given to password managers so they save the password against it */
  username?: string;
};

const PwdRuleChecklist = ({ name }: { name: string }) => {
  const { formDescriptionId } = useFormField();
  const pwd: unknown = useWatch({ name });
  const value = typeof pwd === "string" ? pwd : "";

  return (
    <ul
      id={formDescriptionId}
      className="grid grid-cols-1 gap-x-4 gap-y-1.5 pt-1.5 xs:grid-cols-2"
      aria-label="Password rules"
    >
      {PWD_RULES.map((rule) => {
        const isMet = rule.test(value);

        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-hint transition-colors duration-[120ms] motion-reduce:transition-none",
              isMet ? "text-ink-2" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-[120ms] motion-reduce:transition-none",
                isMet ? "bg-ok text-surface" : "border border-line-strong",
              )}
            >
              {isMet && <CheckIcon weight="bold" className="size-2.5" />}
            </span>
            {rule.label}
            <span className="sr-only">{isMet ? ", met" : ", not met yet"}</span>
          </li>
        );
      })}
    </ul>
  );
};

/** A password input with a show/hide toggle and, for new passwords, a live rules checklist. */
const PasswordField = ({
  name,
  label,
  autoComplete,
  labelAction,
  showRules = false,
  autoFocus,
  username,
}: PasswordFieldProps) => {
  const { control } = useFormContext<FieldValues>();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormField
      {...{ name, control }}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          {username && (
            <input type="email" autoComplete="username" value={username} readOnly hidden />
          )}
          <div className="flex items-center justify-between gap-3">
            <FormLabel>{label}</FormLabel>
            {labelAction}
          </div>
          <div className="relative">
            <FormControl>
              <Input
                type={isVisible ? "text" : "password"}
                className="h-control-lg pe-10"
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                spellCheck={false}
                {...field}
                ref={field.ref}
              />
            </FormControl>
            <button
              type="button"
              className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors duration-[120ms] hover:text-ink focus-visible:shadow-focus motion-reduce:transition-none"
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              onClick={() => setIsVisible((visible) => !visible)}
            >
              {isVisible ? (
                <EyeSlashIcon aria-hidden="true" className="size-4" />
              ) : (
                <EyeIcon aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          <FormMessage />
          {showRules && <PwdRuleChecklist name={name} />}
        </FormItem>
      )}
    />
  );
};

export { PasswordField };
