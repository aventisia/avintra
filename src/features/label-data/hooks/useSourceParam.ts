import { useSearchParams } from "react-router-dom";

export const useSourceParam = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");

  return {
    isFineTuneFlow: source === "fine-tune",
  };
};
