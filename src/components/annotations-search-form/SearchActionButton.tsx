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

interface SearchActionButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
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
  return (
    <Button
      aria-label={ariaLabel}
      disabled={disabled}
      variant="contained"
      type={type}
      sx={sx}
      onClick={onClick}
      size={size}
    >
      {iconOnly ? (children ?? <TuneIcon sx={{ color: 'white' }} />) : children}
    </Button>
  );
}
