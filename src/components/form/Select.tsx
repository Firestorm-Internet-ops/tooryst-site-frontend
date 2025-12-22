import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  group?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  placeholder?: string;
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  defaultValue,
  multiple,
  placeholder = 'Select an option',
  onChange,
  disabled,
  className,
}: SelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;

    if (multiple) {
      const selected = Array.from(event.target.selectedOptions, (option) => option.value);
      onChange(selected);
    } else {
      onChange(event.target.value);
    }
  };

  const groupedOptions = React.useMemo(() => {
    const groups = new Map<string, SelectOption[]>();
    const ungrouped: SelectOption[] = [];

    options.forEach((option) => {
      if (option.group) {
        if (!groups.has(option.group)) {
          groups.set(option.group, []);
        }
        groups.get(option.group)!.push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [options]);

  return (
    <div className="relative">
      <select
        value={value}
        defaultValue={defaultValue}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          'w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
          className
        )}
        role={multiple ? 'listbox' : 'combobox'}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {Array.from(groupedOptions.groups.entries()).map(([groupName, groupOptions]) => (
          <optgroup key={groupName} label={groupName}>
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
        {groupedOptions.ungrouped.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!multiple && (
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      )}
    </div>
  );
}
