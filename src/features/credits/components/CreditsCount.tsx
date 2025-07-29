import { Badge } from "@aventisia/ui/badge";

const CreditsCount = () => {
  return (
    <Badge variant={"outline"} className="py-2 px-4 bg-[#322D74] border-none">
      <p className="text-white text-sm font-semibold">Credits 1,000,000</p>
    </Badge>
  );
};

export default CreditsCount;
