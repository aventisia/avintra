import React from "react";
import JsonViewer from "./JsonViewer";
import { Button } from "@aventisia/ui/buttons";
import { providersData } from "../../constants/llm-providers";

const Test = ({
  setIsTest,
}: {
  setIsTest: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="h-[calc(100%-3rem)]">
      <div className="border-b p-3">Test</div>
      <div className="flex h-full flex-col justify-between">
        <JsonViewer title="Response" jsonData={JSON.stringify(providersData)} />
        <div className="flex justify-end gap-4 border-t p-2">
          <Button
            onClick={() => setIsTest(false)}
            size="sm"
            type="button"
            variant={"ghost"}
          >
            Back
          </Button>
          <Button size="sm" type="button">
            Execute
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Test;
