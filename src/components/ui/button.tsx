import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { TailSpin, ThreeCircles, ThreeDots } from "react-loader-spinner"; // Default loader component

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LoadingProps {
  isLoading: boolean;
  size?: number;
  color?: string;
  width?: number;
  height?: number;
  customLoader?: React.ReactNode;
  loader?: "three-dots" | "three-cicles" | "tailspin"
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: LoadingProps;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const renderLoader = (loader: string, height: number, width: number, color: string, size: number) => {
      switch (loader) {
        case "three-dots":
          return <ThreeDots
            visible={true}
            height={height}
            width={width}
            color={color}
            radius={size} // Adjusted to keep the same ratio as default
            ariaLabel="three-dots-loading"
          />
        case "three-cicles":
          return <ThreeCircles
            visible={true}
            height={height}
            width={width}
            color={color}
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        case "tailspin":
          return <TailSpin
            visible={true}
            height={height}
            width={width}
            color={color}
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
          />

        default:
          return <ThreeDots
            visible={true}
            height={height}
            width={width}
            color={color}
            radius={size} // Adjusted to keep the same ratio as default
            ariaLabel="three-dots-loading"
          />
      }

    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >

        {loading?.isLoading ? (
          loading.customLoader ? (
            loading.customLoader
          ) : renderLoader(loading.loader || "three-dots", loading.height ?? 40, loading.width ?? 40, loading.color ?? "white", (loading.size ?? 40) / 4.44)
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
