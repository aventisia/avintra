import { Form } from "@aventisia/ui/form";
import { SubmitButton } from "@aventisia/ui/buttons";
import { useDefineLLMConfigForm } from "../../hooks/useDefineLLMConfigForm";
import { Tabs } from "@aventisia/ui/tabs";
import { cn } from "@aventisia/ui/lib";
import { useState } from "react";
import TestContent from "../test/Test";
import ModelFormContent from "../model/ModelFormContent";
import PromptFormContent from "../Prompt/PromptFormContent";
import ImproveWithAIButton from "../Prompt/ImproveWithAIButton";
import ExecuteButton from "../test/ExecuteButton";
import ConfigTablist from "./ConfigTablist";

export const LLMConfigForm = () => {
  // Define form
  const { form, isDirty, isSubmitting, onSubmit } = useDefineLLMConfigForm();

  const [selectedTab, setSelectedTab] = useState("Prompt");

  // Return the form
  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="h-[calc(100vh-8rem-var(--header-height)-3*var(--header-padding))] space-y-0 p-0"
      checkDirtyForm={false}
    >
      <Tabs
        onValueChange={setSelectedTab}
        className="h-full w-full p-2.5"
        defaultValue="Prompt"
      >
        <ConfigTablist />

        <PromptFormContent />

        <TestContent />

        <ModelFormContent form={form} />
      </Tabs>
      <div
        className={cn(
          "mt-1 flex w-full justify-end border-t p-2.5",
          selectedTab == "Prompt" && "justify-between",
          selectedTab == "Test" && "justify-start",
        )}
      >
        {selectedTab == "Prompt" && <ImproveWithAIButton form={form} />}
        {selectedTab == "Test" ? (
          <ExecuteButton />
        ) : (
          <SubmitButton
            className="min-w-20"
            disabled={!isDirty}
            isPending={isSubmitting}
            primaryText={"Save"}
          />
        )}
      </div>
    </Form>
  );
};
