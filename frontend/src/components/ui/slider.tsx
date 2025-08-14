"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

// Add id prop to the component props interface
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    id?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps // Use the extended interface
>(({ className, id, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    id={id} // Pass id to the primitive root
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {/* Render multiple thumbs if the value is an array */}
    {(Array.isArray(props.value) ? props.value : [props.value ?? props.defaultValue ?? 0]).map((_, index) => (
        <SliderPrimitive.Thumb
        key={index}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
