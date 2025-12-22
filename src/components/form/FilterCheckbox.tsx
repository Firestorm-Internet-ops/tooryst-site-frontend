import * as React from 'react';
import { cn } from '@/lib/utils';

interface FilterCheckboxProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function FilterCheckbox({
  label,
  checked,
  defaultChecked,
  disabled,
  indeterminate,
  onChange,
  className,
}: FilterCheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 text-sm text-gray-700',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary-500 focus:ring-2 focus:ring-primary-100 focus:ring-offset-0 disabled:cursor-not-allowed"
      />
      <span>{label}</span>
    </label>
  );
}
