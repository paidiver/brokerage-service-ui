import TuneIcon from '@mui/icons-material/Tune';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SearchActionButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  sx?: SxProps<Theme>;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export function SearchActionButton({
  ariaLabel,
  children,
  iconOnly = false,
  sx,
  onClick,
  type = 'submit'
}: SearchActionButtonProps) {
  return (
    <Button aria-label={ariaLabel} variant="contained" type={type} sx={sx} onClick={onClick}>
      {iconOnly ? <TuneIcon sx={{ color: 'white' }} /> : children}
    </Button>
  );
}
