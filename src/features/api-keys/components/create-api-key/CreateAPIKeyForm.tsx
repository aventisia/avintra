import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { CircleCheckBig, Copy } from "lucide-react";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

import { createNewAPIKeyZodSchema } from "../../constants/create-new-api-key-zod-schema";
import { useCreateNewAPIKeyForm } from "../../hooks/useCreateNewAPIKeyForm";
import { useFetchApiKeys } from "../../hooks/useFetchAPIKeys";
import { useCreateNewApiKeyDialogStore } from "../../store/create-new-api-key-dialog-store";

const CreateAPIKeyForm = () => {
  const { form, isSubmitting, isDirty, addApiKey, isUpdatePending } =
    useCreateNewAPIKeyForm();
  const [step, setStep] = useState(0);
  const { setOpen } = useCreateNewApiKeyDialogStore();
  const { refetch } = useFetchApiKeys();
  const [apiKeyToShow, setApiKeyToShow] = useState<string>("");

  async function submitHandler(
    formData: z.infer<typeof createNewAPIKeyZodSchema>,
  ) {
    try {
      const data = await addApiKey(formData);
      setApiKeyToShow(data?.data?.apiKey || "");
      setStep(1);
      refetch();
    } catch (error) {
      console.log(error);
    }
  }

  if (step === 0) {
    return (
      <Form
        methods={form}
        onSubmit={form.handleSubmit(submitHandler)}
        disabled={isSubmitting}
        className="p-5"
      >
        <FormProvider {...form}>
          <InputField
            className="text-sm"
            name="name"
            isRequired={true}
            label="API Key Name"
          />
        </FormProvider>

        <div className="text-right !mt-6">
          <Button
            size="sm"
            className="w-24"
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            {isUpdatePending ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              "Create Key"
            )}
          </Button>
        </div>
      </Form>
    );
  }

  return (
    <>
      <div className=" h-[calc(100vh-3.6rem)] flex flex-col justify-center text-center gap-1 ">
        <div className="flex justify-center">
          <CircleCheckBig className="text-success-foreground h-8 w-8" />
        </div>
        <p className="font-semibold">API Key Generated Successfully!</p>
        <p className="text-sm text-slate-500 mb-2">
          This key will only be shown once. Please copy and store it
          securely.{" "}
        </p>
        <div className="flex justify-between items-center gap-2 border w-[350px] mx-auto text-sm pl-2 pr-1 py-1 rounded-lg">
          <p className="text-sm text-muted-foreground">{apiKeyToShow}</p>
          <Button
            variant={"ghost"}
            className="flex gap-1.5 bg-[#F3F2FF] text-primary"
            onClick={() => {
              navigator.clipboard.writeText(apiKeyToShow);
              toast.success("API Key Copied");
            }}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>
      <Button
        className="w-auto absolute bottom-4 right-4"
        onClick={() => setOpen(false)}
      >
        Done
      </Button>
    </>
  );
};

export default CreateAPIKeyForm;
