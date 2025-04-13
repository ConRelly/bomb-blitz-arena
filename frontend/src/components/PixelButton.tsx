import React from "react";
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";

const pixelButtonVariants = cva(
  "relative font-medium text-center transition-all active:translate-y-1 active:shadow-none", {
    variants: {
      variant: {
        primary: "bg-red-500 text-white shadow-[0_4px_0_0_theme(colors.red.700)] hover:bg-red-600",
        secondary: "bg-blue-400 text-white shadow-[0_4px_0_0_theme(colors.blue.600)] hover:bg-blue-500",
        success: "bg-green-500 text-white shadow-[0_4px_0_0_theme(colors.green.700)] hover:bg-green-600",
      },
      size: {
        sm: "text-sm py-1 px-3",
        md: "text-base py-2 px-4",
        lg: "text-lg py-3 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pixelButtonVariants> {
  asChild?: boolean;
}

export const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <Button
        className={pixelButtonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

PixelButton.displayName = "PixelButton";
