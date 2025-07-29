import { useToggleCreateNewCredentialsDialogStore } from "@/features/create-new-credentials/store/toggle-add-credentials-store";
import { SelectField } from "@/shared/select-field/SelectField";

import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";
import { Plus } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import {
  credentailsProps,
  fileIdProps,
  folderIdProps,
  scopeProps,
} from "../../constants/storage-connect-field-props";
import { storageConnectFormZodSchema } from "../../constants/storage-connect-zod-schema";
import { CredentailsEnum } from "../../enums/credentails-enum";
import { useStorageConnectForm } from "../../hooks/useStorageConnectForm";
import { useToggleCredentailsDialogStore } from "../../store/toggle-add-credentials-store";

const StorageConnectForm = () => {
  const { form, isSubmitting, isDirty } = useStorageConnectForm();
  const { setShowAddCredentailsDialog } = useToggleCredentailsDialogStore();
  const { setShowCreateNewCredentialsDialog } =
    useToggleCreateNewCredentialsDialogStore();
  const scopeValue = form.watch("scope");

  async function submitHandler(
    formData: z.infer<typeof storageConnectFormZodSchema>,
  ) {
    console.log(formData);
    setShowAddCredentailsDialog(false);
  }

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(submitHandler)}
      disabled={isSubmitting}
      className="p-5"
    >
      <FormProvider {...form}>
        <SelectField
          {...credentailsProps}
          selectOptions={[...enumToArray(CredentailsEnum)]}
        >
          <Button
            className="w-full bg-primary-foreground gap-1 hover:text-primary"
            variant={"outline"}
            onClick={() => setShowCreateNewCredentialsDialog(true)}
          >
            <Plus size={18} /> Create New Credential
          </Button>
        </SelectField>

        <SelectField {...scopeProps} />
        {scopeValue === "File" && <InputField {...fileIdProps} />}
        {scopeValue === "Folder" && <InputField {...folderIdProps} />}
      </FormProvider>

      <div className="text-right !mt-6">
        <Button
          size="sm"
          className="w-24"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          Connect
        </Button>
      </div>
    </Form>
  );
};

export default StorageConnectForm;
