import TuneIcon from '@mui/icons-material/Tune';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SearchActionButtonProps {
  ariaLabel?: string;
  children?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
  download?: string;
  href?: string;
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
  download,
  href,
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

  const mergedSx = [baseSx, ...(Array.isArray(sx) ? sx : [sx])].filter(Boolean) as SxProps<Theme>;
  const content = iconOnly ? (children ?? <TuneIcon sx={{ color: 'white' }} />) : children;

  if (href) {
    return (
      <Button
        component="a"
        aria-label={ariaLabel}
        download={download}
        href={href}
        target="_blank"
        variant="contained"
        sx={mergedSx}
        onClick={onClick}
        size={size}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      aria-label={ariaLabel}
      disabled={disabled}
      variant="contained"
      type={type}
      sx={mergedSx}
      onClick={onClick}
      size={size}
    >
      {content}
    </Button>
  );
}
