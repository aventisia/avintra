import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PwdZodSchema } from '../types/pwd-zod-schema';

export const useUpdatePassword = () => {
  const form = useForm<z.infer<typeof PwdZodSchema>>({
    resolver: zodResolver(PwdZodSchema),
    defaultValues: {
      oldPwd: "",
      newPwd: "",
      cofirmNewPwd: "",
      logoffFromOtherSessions: false
    },
  });


  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof PwdZodSchema>) => {
    return {
      ...formData
    };
  };

  // Return form and methods
  return {
    form,
    refineFormData,
  };
};
