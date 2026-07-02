import { Box, Switch, Typography } from '@mui/material';

interface IncludeDescendantsToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function IncludeDescendantsToggle({ checked, onChange }: IncludeDescendantsToggleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Switch
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: 'black'
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'black'
          }
        }}
      />

      <Box>
        <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
          include
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
          children
        </Typography>
      </Box>
    </Box>
  );
}
