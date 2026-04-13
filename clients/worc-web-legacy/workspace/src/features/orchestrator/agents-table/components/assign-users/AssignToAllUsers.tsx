import { Form, SwitchField } from "@aventisia/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function AssignToAllUsers() {
  const assignAllSchema = z.object({
    assignAll: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof assignAllSchema>>({
    resolver: zodResolver(assignAllSchema),
    defaultValues: {
      assignAll: false,
    },
  });

  const onSubmit = (data: z.infer<typeof assignAllSchema>) => {
    console.log(" Payload:", data);
  };

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="p-4 pb-0">
      <SwitchField
        label="Assign to all team members"
        description="All users in this workspace will be assigned automatically
"
        name="assignAll"
        size="sm"
      />
    </Form>
  );
}
