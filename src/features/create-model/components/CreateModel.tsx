import { Tabs, TabsList, TabsContent, TabsTrigger } from "@aventisia/ui/tabs";
import PromptForm from "./Prompt/PromptForm";
import { DialogClose } from "@aventisia/ui/dialog";
import { Button, buttonVariants } from "@aventisia/ui/buttons";
import { FlaskConicalIcon, X } from "lucide-react";
import { cn } from "@aventisia/ui/lib";
import { useState } from "react";
import { LLMConfigForm } from "./llm-config/LLMConfigForm";
import Test from "./test/Test";

const CreateModel = () => {
  const [isTest, setIsTest] = useState(false);
  return (
    <div className="relative h-full">
      <div className="h-full">
        {isTest ? (
          <Test setIsTest={setIsTest} />
        ) : (
          <>
            <Tabs className="h-[calc(100%-2rem)]" defaultValue="Prompt">
              <div className="border-b py-1">
                <TabsList className="w-full justify-start rounded-lg bg-white text-base">
                  <TabsTrigger
                    value="Prompt"
                    className="rounded-none outline-none data-[state=active]:border-b-black"
                  >
                    Prompt
                  </TabsTrigger>
                  <TabsTrigger
                    value="LLM"
                    className="rounded-none outline-none data-[state=active]:border-b-black"
                  >
                    LLM
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent className="h-full" value="Prompt">
                <PromptForm />
              </TabsContent>
              <TabsContent className="h-full" value="LLM">
                <LLMConfigForm />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      {/* Right side - Dialog action buttons */}
      <div className="absolute right-2 top-2 flex items-center gap-2">
        {/* Extras */}
        {!isTest && (
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 rounded-full border-primary px-4 py-0.5 text-primary hover:text-primary",
            )}
            type="button"
            size={"xs"}
            onClick={() => setIsTest(true)}
          >
            <FlaskConicalIcon className="h-3.5 w-3.5" />
            Test
          </Button>
        )}
        {/* Close Dialog */}
        <DialogClose
          className={buttonVariants({ variant: "ghost", size: "icon8" })}
        >
          <X className="h-5 w-5 text-[--icon-color]" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
    </div>
  );
};

export default CreateModel;
