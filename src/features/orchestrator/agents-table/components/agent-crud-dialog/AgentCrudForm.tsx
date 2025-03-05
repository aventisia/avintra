import { Button } from "@/react-toolkit/ui/buttons/Button";
import { InputField } from "@/react-toolkit/ui/form/fields/InputField";
import { SwitchField } from "@/react-toolkit/ui/form/fields/SwitchField";
import { Form } from "@/react-toolkit/ui/form/Form";
import {
  idProps,
  isDisabledProps,
  machineCountProps,
  nameProps,
  projectIdProps,
  versionNumberProps,
} from "../../constants/agent-form-field-props";
import { useDefineAgentForm } from "../../hooks/useDefineAgentForm";
import { AutherCard } from "@/react-toolkit/ui/form/non-field/AutherCard";

export const AgentCrudForm = () => {
  // Define agent form
  const { form, isDirty, crudAction } = useDefineAgentForm();

  // Is form in read mode?
  const isReadMode = crudAction === "read";

  // Return the form
  return (
    <Form methods={form} className="px-2.5 pb-5" disabled={isReadMode}>
      {/* FlowId Id */}
      {isReadMode && <InputField {...projectIdProps} />}

      {/* Agent Id */}
      {isReadMode && <InputField {...idProps} />}

      {/* Name */}
      <InputField {...nameProps} />

      {/* machine count */}
      <InputField {...machineCountProps} />

      {/* version number */}
      <InputField {...versionNumberProps} />

      {/* Is Disabled */}
      {crudAction !== "create" && <SwitchField {...isDisabledProps} />}

      {/* AutherCard */}
      {isReadMode && (
        <AutherCard
          createdBy={form.getValues("createdBy")}
          createdOn={form.getValues("createdOn")}
          lastModifiedBy={form.getValues("lastModifiedBy")}
          lastModifiedOn={form.getValues("lastModifiedOn")}
        />
      )}

      {/* Submit button */}
      {!isReadMode && (
        <div className="!mt-5 flex w-full justify-end">
          <Button type="submit" disabled={!isDirty} className="min-w-[5rem]">
            {crudAction === "create" ? "Create agent" : "Save changes"}
          </Button>
        </div>
      )}
    </Form>
  );
};
