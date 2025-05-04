
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export type SelectOption = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: SelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
  disabled,
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value: string, event: React.MouseEvent) => {
     event.stopPropagation(); // Prevent popover from opening/closing
    const newSelected = selected.filter((item) => item !== value);
    onChange(newSelected);
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-10', selected.length > 0 ? 'h-auto' : 'h-10', className)} // Adjust height based on selection
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge
                  variant="secondary"
                  key={value}
                  className="mr-1 mb-1"
                  onClick={(e) => handleRemove(value, e)}
                >
                  {option ? option.label : value}
                  <X className="ml-1 h-3 w-3 cursor-pointer" />
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
           <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                    {options.map((option) => (
                    <CommandItem
                        key={option.value}
                        value={option.label} // Search by label
                        onSelect={(currentValue) => {
                            // Find value based on label, then toggle
                            const optionToToggle = options.find(opt => opt.label.toLowerCase() === currentValue.toLowerCase());
                            if(optionToToggle){
                                handleSelect(optionToToggle.value);
                            }
                            // setOpen(false); // Keep open for multi-select
                        }}
                    >
                        <Check
                        className={cn(
                            'mr-2 h-4 w-4',
                            selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                        )}
                        />
                        {option.label}
                    </CommandItem>
                    ))}
                </CommandGroup>
           </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { MultiSelect };
