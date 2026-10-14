import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const FilterDropdown = ({
  icon: Icon,
  options,
  value,
  onChange,
  disabled,
  ariaLabel,
  isOptionDisabled,
}) => {
  const current =
    options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={`${ariaLabel}: ${current.label}`}
          />
        }
      >
        <Icon className="size-4 sm:mr-2" aria-hidden="true" />
        <span className="hidden sm:inline">{current.label}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            disabled={isOptionDisabled?.(option.value)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            <Check
              className={cn(
                'ml-auto size-4',
                value !== option.value && 'invisible',
              )}
              aria-hidden="true"
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
