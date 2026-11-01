import { toast } from "@avplatform/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getMyProfileInfo } from "../apis/my-account-apis";
import { UserProfileZodSchema } from "../types/profile-zod-schema";

export const useDefineProfileInfoForm = () => {
  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof UserProfileZodSchema>>({
    resolver: zodResolver(UserProfileZodSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      // dateOfBirth: new Date(),
      phoneNumber: "",
      // addressLine1: "",
      // addressLine2: "",
      // gender: "PreferNotToSay",
      country: null,
      // city: "",
      // stateOrProvince: "",
      // zipOrPostalCode: "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGetMyAccountInfo = async () => {
      setIsLoading(true);
      try {
        const { data: profileInfoData } = await getMyProfileInfo();
        form.reset({
          firstName: profileInfoData?.firstName ?? "",
          lastName: profileInfoData?.lastName ?? "",
          // dateOfBirth: new Date(profileInfoData?.dateOfBirth) ?? new Date(),
          phoneNumber: profileInfoData?.phoneNumber ?? "",
          // addressLine1: profileInfoData?.addressLine1 ?? "",
          // addressLine2: profileInfoData?.addressLine2 ?? "",
          // gender: profileInfoData?.gender ?? "PreferNotToSay",
          country: profileInfoData?.country ?? null,
          // city: profileInfoData?.city ?? "",
          // stateOrProvince: profileInfoData?.stateOrProvince ?? "",
          // zipOrPostalCode: profileInfoData?.zipOrPostalCode ?? "",
        });
        /* IMPORTANT NOTE: Stay loading on failure so Save stays off; the backend overwrites the hidden phone number and country with whatever is sent. */
        setIsLoading(false);
      } catch {
        toast.error("Couldn't load your profile. Close and reopen to try again.");
      }
    };

    fetchGetMyAccountInfo();
  }, [form]);

  // Return form and methods
  return {
    form,
    isDirty,
    isLoading,
  };
};
