import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/30 hover:brightness-110 dark:shadow-blue-900/30',
        destructive: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm shadow-red-500/25 hover:shadow-md hover:shadow-red-500/30 hover:brightness-110',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline dark:text-sky-400',
        brand: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-sm hover:shadow-md hover:brightness-110',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
