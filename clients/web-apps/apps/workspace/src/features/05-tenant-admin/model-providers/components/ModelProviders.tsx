import { Button } from "@avplatform/ui/buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@avplatform/ui/cards";
import { Input } from "@avplatform/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  getProviderIcon,
  modelProviderDefinitions,
} from "../constants/model-provider-definitions";
import { useFetchModelProviders } from "../hooks/useFetchModelProviders";
import { useModelProviderDialogStore } from "../store/model-provider-dialog-store";
import { ModelProviderSetupDialog } from "./ModelProviderSetupDialog";

/**
 * Renders the grid of model provider cards under Tenant Admin > Model Providers.
 * Each card shows the provider brand, a description, the enabled models (if any),
 * and a Setup button that opens the multi-step configuration dialog.
 */
export const ModelProviders = () => {
  const { openDialog } = useModelProviderDialogStore();
  const { data } = useFetchModelProviders();

  const [searchQuery, setSearchQuery] = useState("");

  const configuredProviders = data?.data ?? [];

  // Filter providers by name.
  const filteredDefinitions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return modelProviderDefinitions.filter((provider) => {
      if (query && !provider.label.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [searchQuery]);

  // Sort cards: enabled providers first, then disabled, then unconfigured.
  const sortedProviders = [...filteredDefinitions].sort((a, b) => {
    const aConfig = configuredProviders.find((c) => c.providerType === a.value);
    const bConfig = configuredProviders.find((c) => c.providerType === b.value);

    const aRank = !aConfig ? 2 : aConfig.isDisabled ? 1 : 0;
    const bRank = !bConfig ? 2 : bConfig.isDisabled ? 1 : 0;

    return aRank - bRank;
  });

  return (
    <div className="space-y-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-medium">Models</p>
          <p className="text-sm text-muted-foreground">
            Configure AI model providers and choose the models your tenant can use.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search providers..."
            className="pl-8"
          />
        </div>
      </div>

      {sortedProviders.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-muted-foreground">
          No providers match your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedProviders.map((provider) => {
            const config = configuredProviders.find((c) => c.providerType === provider.value);
            const enabledModelIds = config?.enabledModelIds ?? [];
            const enabledCount = enabledModelIds.length;
            const isDisabled = Boolean(config?.isDisabled);

            return (
              <Card key={provider.value} className="flex flex-col p-4 hover:shadow-md">
                <CardHeader className="flex-row items-center gap-3 p-0">
                  <div className={`rounded-lg bg-accent p-2 ${isDisabled ? "opacity-60" : ""}`}>
                    <img src={getProviderIcon(provider)} alt={provider.label} className="h-6 w-6" />
                  </div>
                  <CardTitle className="!mt-0 text-base capitalize">{provider.label}</CardTitle>
                  {config && !config.isDisabled ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Enabled
                    </span>
                  ) : null}
                  {config?.isDisabled ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Disabled
                    </span>
                  ) : null}
                </CardHeader>

                <CardDescription className="mt-3 line-clamp-2">
                  {provider.description}
                </CardDescription>

                {/* Fixed-height content: models are constrained to a single line */}
                <CardContent className="mt-3 h-14 flex-1 p-0">
                  {enabledCount > 0 ? (
                    <div className="flex h-6 items-center gap-1.5">
                      {enabledModelIds.slice(0, 3).map((modelId) => (
                        <span
                          key={modelId}
                          className="max-w-[8rem] truncate rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                          {modelId}
                        </span>
                      ))}
                      {enabledCount > 3 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 shrink-0 rounded-md bg-accent px-2 py-0 text-xs font-medium text-primary"
                            >
                              +{enabledCount - 3} models
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-72">
                            <div className="space-y-1">
                              {enabledModelIds.map((modelId) => (
                                <div
                                  key={modelId}
                                  className="truncate rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                                >
                                  {modelId}
                                </div>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No models enabled yet.</p>
                  )}
                </CardContent>

                <CardFooter className="mt-2 justify-end p-0">
                  <Button
                    variant="ghost"
                    className="bg-transparent font-normal text-primary"
                    onClick={() => openDialog(provider, config)}
                  >
                    {config ? "Configure" : "Setup"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <ModelProviderSetupDialog />
    </div>
  );
};
