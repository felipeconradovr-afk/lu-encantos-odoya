'use client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
export function SelectField({
  label,
  value,
  options,
  onChange,
  id,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="field">
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v ?? '')}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          className="select-control"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem value={option} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
