import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const NumberInput = React.forwardRef(({ className, value, onChange, min = 0, max = Infinity, step = 1, ...props }, ref) => {
  const handleIncrement = () => {
    const newValue = Math.min(max, Number(value) + step);
    if (onChange) onChange({ target: { value: newValue } });
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, Number(value) - step);
    if (onChange) onChange({ target: { value: newValue } });
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (newValue === '') {
      if (onChange) onChange({ target: { value: '' } });
      return;
    }
    
    // Allow decimal input
    if (!/^-?\d*\.?\d*$/.test(newValue)) {
      return;
    }

    if (newValue.endsWith('.')) {
      if (onChange) onChange({ target: { value: newValue } });
      return;
    }

    newValue = Number(newValue);
    if (!isNaN(newValue)) {
        if (newValue > max) newValue = max;
        if (newValue < min) newValue = min;
        if (onChange) onChange({ target: { value: newValue } });
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-r-none"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="text"
        inputMode="decimal"
        pattern="^-?\d*\.?\d*$"
        className="h-10 rounded-none border-x-0 text-center"
        value={value}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-l-none"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});
NumberInput.displayName = 'NumberInput';

export { NumberInput };