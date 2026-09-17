import TuneIcon from '@mui/icons-material/Tune';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SearchActionButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export function SearchActionButton({
  ariaLabel,
  children,
  iconOnly = false,
  disabled = false,
  sx,
  size = 'medium',
  onClick,
  type = 'submit'
}: SearchActionButtonProps) {
  const baseSx: SxProps<Theme> = {
    color: 'common.white',
    bgcolor: 'grey.800',
    ...(iconOnly && {
      minWidth: 32,
      width: 32,
      height: 32,
      p: 0.5
    }),
    '&:hover': {
      bgcolor: 'grey.900',
      opacity: 0.9
    }
  };

  return (
    <Button
      aria-label={ariaLabel}
      disabled={disabled}
      variant="contained"
      type={type}
      sx={[baseSx, ...(Array.isArray(sx) ? sx : [sx])].filter(Boolean) as SxProps<Theme>}
      onClick={onClick}
      size={size}
    >
      {iconOnly ? (children ?? <TuneIcon sx={{ color: 'white' }} />) : children}
    </Button>
  );
}
