import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TextFieldProps } from '@mui/material/TextField';
import type { HTMLInputTypeAttribute } from 'react';

type FormFieldOption = {
  value: string;
  label: string;
};

const sharedFieldSx: SxProps<Theme> = {
  minWidth: 180,
  flex: '1 1 180px',
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'black'
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'black'
  }
};

interface SharedFieldProps {
  label: string;
  sx?: SxProps<Theme>;
}

interface SelectFieldProps extends SharedFieldProps {
  id: string;
  value: string;
  options: readonly FormFieldOption[];
  emptyLabel?: string;
  onChange: (value: string) => void;
}

interface TextInputFieldProps extends SharedFieldProps {
  value: string;
  type?: HTMLInputTypeAttribute;
  onChange: (value: string) => void;
}

export function mergeFieldSx(sx?: SxProps<Theme>): SxProps<Theme> {
  if (!sx) return sharedFieldSx;
  return [sharedFieldSx, sx] as SxProps<Theme>;
}

export function FormTextField({ sx, ...props }: TextFieldProps) {
  return <TextField {...props} sx={mergeFieldSx(sx)} />;
}

export function SelectField({
  id,
  label,
  value,
  options,
  emptyLabel = 'Any',
  sx,
  onChange
}: SelectFieldProps) {
  const labelId = `${id}-label`;

  return (
    <FormControl size="small" sx={mergeFieldSx(sx)}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(event: SelectChangeEvent) => onChange(event.target.value)}
      >
        <MenuItem value="">{emptyLabel}</MenuItem>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function TextInputField({
  label,
  value,
  type = 'text',
  sx,
  onChange
}: TextInputFieldProps) {
  return (
    <FormTextField
      label={label}
      size="small"
      type={type}
      value={value}
      sx={sx}
      onChange={event => onChange(event.target.value)}
    />
  );
}
