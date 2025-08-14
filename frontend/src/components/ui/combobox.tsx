
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCustomValue?: boolean // New prop
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  emptyText = "No option found.",
  className,
  disabled,
  allowCustomValue = false // Default to false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value ?? ""); // State to track input value

   // Update input value when the external value changes
   React.useEffect(() => {
     const currentOption = options.find((option) => option.value === value);
     setInputValue(currentOption?.label ?? value ?? ""); // Use label if found, otherwise use value or empty string
   }, [value, options]);


   const handleSelect = (selectedValue: string) => {
      const option = options.find(o => o.label.toLowerCase() === selectedValue.toLowerCase());
      const newValue = option ? option.value : (allowCustomValue ? selectedValue : undefined); // Use custom value only if allowed
      onChange(newValue);
      setInputValue(option ? option.label : selectedValue); // Update input display
      setOpen(false);
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {inputValue || placeholder} {/* Display input value or placeholder */}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={!allowCustomValue}> {/* Disable default filtering if custom values are allowed */}
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue} // Bind CommandInput value to state
            onValueChange={setInputValue} // Update state on input change
          />
          <CommandList>
            <CommandEmpty>
                {allowCustomValue && inputValue ? `Use "${inputValue}"` : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Use label for matching and display
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
               {/* Add option to use custom value if allowed and input exists */}
               {allowCustomValue && inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) && (
                 <CommandItem
                   key="__custom__"
                   value={inputValue} // Use the current input value
                   onSelect={handleSelect}
                 >
                    <span className="mr-2 h-4 w-4" /> {/* Placeholder for alignment */}
                    Use "{inputValue}"
                 </CommandItem>
               )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
