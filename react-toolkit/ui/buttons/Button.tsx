import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/react-toolkit/lib/utils'
import { buttonVariants } from '@/react-toolkit/ui/buttons/button-variants'

// TODO: Need to export this in other repositories
/** Base Button props interface */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/** Basic/Default button implementation using buttonVariants tailwind classes */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
