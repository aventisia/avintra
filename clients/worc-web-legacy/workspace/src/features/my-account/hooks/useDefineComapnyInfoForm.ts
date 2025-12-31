import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getBillingAddress } from "../apis/my-account-apis";
import { BillingAddressZodSchema } from "../types/company-zod-schema";

export const useDefineComapnyInfoForm = () => {
  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof BillingAddressZodSchema>>({
    resolver: zodResolver(BillingAddressZodSchema),
    defaultValues: {
      tenantName: "",
      designantion: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      stateOrProvince: "",
      city: "",
      zipOrPostalCode: "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGetBillingAddress = async () => {
      setIsLoading(true);
      try {
        const { data: billingAddressData } = await getBillingAddress();
        form.reset({
          tenantName: billingAddressData?.tenantName,
          designantion: billingAddressData?.designation,
          addressLine1: billingAddressData?.addressLine1,
          addressLine2: billingAddressData?.addressLine2,
          country: billingAddressData?.country,
          stateOrProvince: billingAddressData?.stateOrProvince,
          city: billingAddressData?.city,
          zipOrPostalCode: billingAddressData?.zipOrPostalCode,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGetBillingAddress();
  }, []);

  // Return form and methods
  return {
    form,
    isDirty,
    isLoading,
  };
};
