'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface ResultsPaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

function pageItems(page: number, totalPages: number): (number | string)[] {
  const visible = new Set([1, 2, totalPages - 1, totalPages]);
  const center = Math.max(2, Math.min(page, totalPages - 1));
  for (let value = center - 1; value <= center + 1; value++) visible.add(value);
  const pages = Array.from(visible)
    .filter(value => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const items: (number | string)[] = [];
  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous && value - previous === 2) items.push(previous + 1);
    else if (previous && value - previous > 2) items.push(`gap-${previous}`);
    items.push(value);
  });
  return items;
}

export function ResultsPagination({
  page,
  totalPages,
  disabled = false,
  onPageChange
}: ResultsPaginationProps) {
  if (totalPages <= 1) return null;

  const buttonSx = {
    minWidth: { xs: 24, sm: 28 },
    height: 32,
    px: 0.75,
    color: 'grey.800',
    fontSize: 13,
    textTransform: 'none' as const,
    borderRadius: 1,
    '&.Mui-focusVisible': { outline: '2px solid', outlineOffset: 2 }
  };

  return (
    <Box component="nav" aria-label="Search results pagination" sx={{ mt: 6, mb: 3 }}>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 0, sm: 0.5 },
          p: 0,
          m: 0,
          listStyle: 'none'
        }}
      >
        <li>
          <Button
            aria-label="Previous page"
            disabled={disabled || page === 1}
            onClick={() => onPageChange(page - 1)}
            sx={buttonSx}
          >
            <ArrowBackIcon sx={{ fontSize: 14, mr: { xs: 0, sm: 0.75 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Previous
            </Box>
          </Button>
        </li>
        {pageItems(page, totalPages).map(item => (
          <li key={item}>
            {typeof item === 'number' ? (
              <Button
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => onPageChange(item)}
                sx={{
                  ...buttonSx,
                  ...(item === page && {
                    bgcolor: 'grey.800',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'grey.900' },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.800',
                      color: 'common.white',
                      opacity: 0.55
                    }
                  })
                }}
              >
                {item}
              </Button>
            ) : (
              <Typography component="span" aria-hidden="true" sx={{ display: 'block', px: 0.5 }}>
                …
              </Typography>
            )}
          </li>
        ))}
        <li>
          <Button
            aria-label="Next page"
            disabled={disabled || page === totalPages}
            onClick={() => onPageChange(page + 1)}
            sx={buttonSx}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Next
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 14, ml: { xs: 0, sm: 0.75 } }} />
          </Button>
        </li>
      </Box>
    </Box>
  );
}
