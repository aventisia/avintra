import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";

const OnErrorTabs = () => {
  return (
    <Tabs defaultValue="retryPolicy" className="w-full">
      <TabsList className="flex justify-between">
        <TabsTrigger
          value="retryPolicy"
          className="flex-1 rounded-none border-0 border-b border-border data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-transparent"
        >
          Retry policy
        </TabsTrigger>
        <TabsTrigger
          value="allErrors"
          className="flex-1 rounded-none border-0 border-b border-border data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-transparent"
        >
          All errors
        </TabsTrigger>
        <TabsTrigger
          value="advance"
          className="flex-1 rounded-none border-0 border-b border-border data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-transparent"
        >
          Advance
        </TabsTrigger>
      </TabsList>
      <TabsContent value="retryPolicy">Retry policy</TabsContent>
      <TabsContent value="allErrors">All errors</TabsContent>
      <TabsContent value="advance">Advance</TabsContent>
    </Tabs>
  );
};

export default OnErrorTabs;
