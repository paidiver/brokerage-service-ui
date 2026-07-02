import TuneIcon from '@mui/icons-material/Tune';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface SearchActionButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  sx?: SxProps<Theme>;
}

export function SearchActionButton({
  ariaLabel,
  children,
  iconOnly = false,
  sx
}: SearchActionButtonProps) {
  return (
    <Button aria-label={ariaLabel} variant="contained" type="submit" sx={sx}>
      {iconOnly ? <TuneIcon sx={{ color: 'white' }} /> : children}
    </Button>
  );
}
