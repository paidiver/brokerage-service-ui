'use client';

import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';

type SourceValue = 'all' | 'bodc' | 'jncc';

interface SourceSelectProps {
  value?: SourceValue;
  onChange?: (value: SourceValue) => void;
}

const sourceOptions: { value: SourceValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'bodc', label: 'BODC' },
  { value: 'jncc', label: 'JNCC' }
];

export function SourceSelect({ value = 'all', onChange }: SourceSelectProps) {
  const labelId = 'annotations-source-select-label';
  const [internalValue, setInternalValue] = useState<SourceValue>(value);
  const selectedValue = onChange ? value : internalValue;

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl
        fullWidth
        size="small"
        sx={{
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'black'
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black'
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black'
          }
        }}
      >
        <InputLabel id={labelId}>Source</InputLabel>

        <Select
          labelId={labelId}
          id="annotations-source-select"
          value={selectedValue}
          label="Source"
          onChange={event => {
            const nextValue = event.target.value as SourceValue;
            setInternalValue(nextValue);
            onChange?.(nextValue);
          }}
        >
          {sourceOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
