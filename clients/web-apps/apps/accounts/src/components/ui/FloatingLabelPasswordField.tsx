import { Input } from "@avplatform/ui";
import { FloatingLabelInputField } from "@avplatform/ui/form";
import { CheckIcon, XIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

interface FloatingLabelPasswordFieldProps extends React.ComponentPropsWithoutRef<typeof Input> {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** The label of the form field. */
  label: string;

  /** To override the style of the label. */
  labelClassName?: string;
}

export default function FloatingLabelPasswordField({ ...props }: FloatingLabelPasswordFieldProps) {
  const id = useId();
  const [password, setPassword] = useState("");

  // Password Checks
  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[^A-Za-z0-9]/, text: "At least 1 special character" },
      { regex: /^.{0,16}$/, text: "No more than 16 characters" }, // ✅ NEW RULE
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);

  const strengthScoreRaw = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  // Normalize the score to a scale of 0–5
  const strengthScore = useMemo(() => {
    return Math.floor((strengthScoreRaw / 6) * 5);
  }, [strengthScoreRaw]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 2) return "bg-bad";
    if (score === 3) return "bg-warn";
    if (score === 4) return "bg-warn";
    return "bg-ok"; // score === 5
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3 || score === 4) return "Medium password";
    return "Strong password"; // score === 5
  };

  return (
    <div>
      <FloatingLabelInputField
        {...props}
        type="password"
        onChangeCapture={(e) => setPassword(e.currentTarget.value)}
      />
      {password && (
        <div className="mt-3 border rounded-lg p-3 bg-sunken">
          {/* Strength bar */}
          <div className="mb-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-200 ease-in-out ${
                    i < strengthScore ? getStrengthColor(strengthScore) : "bg-fill"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Strength description */}
          <p id={`${id}-description`} className="text-foreground mb-2 text-sm font-medium">
            {getStrengthText(strengthScore)}. Must contain:
          </p>

          {/* Requirement list */}
          <ul className="space-y-1.5 grid grid-cols-2" aria-label="Password requirements">
            {strength.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon size={16} className="text-ok" aria-hidden="true" />
                ) : (
                  <XIcon size={16} className="text-muted-foreground/80" aria-hidden="true" />
                )}
                <span className={`text-xs ${req.met ? "text-ok" : "text-muted-foreground"}`}>
                  {req.text}
                  <span className="sr-only">
                    {req.met ? " - Requirement met" : " - Requirement not met"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
