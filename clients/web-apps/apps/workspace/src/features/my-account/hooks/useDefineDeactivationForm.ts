import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getDeactivationStatus } from "../apis/my-account-apis";
import { AccountDeactivationZodSchema } from "../components/account-deactivation-tab/AccountDeactivation";
import type { DeactivationStatusDto } from "../dtos/deactivation-status-user-account-dto";

export const useDefineDeactivationForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof AccountDeactivationZodSchema>>({
    resolver: zodResolver(AccountDeactivationZodSchema),
    defaultValues: {
      confirmDelete: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [deactivationStatusData, setDeactivationStatusData] = useState<DeactivationStatusDto>();

  useEffect(() => {
    const fetchDeactivationStatus = async () => {
      setIsLoading(true);
      try {
        const { data: deactivationStatusData } = await getDeactivationStatus();
        deactivationStatusData.timeRemains = new Date(
          deactivationStatusData?.timeRemains as unknown as string,
        );
        setDeactivationStatusData(deactivationStatusData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeactivationStatus();
  }, []);

  // Destructor form values and methods
  const {
    formState: { isDirty, isSubmitting },
  } = form;

  // Return form and methods
  return {
    form,
    isLoading,
    isDirty,
    isSubmitting,
    deactivationStatusData,
  };
};
