import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

export function AnnotationsSkeleton() {
  return (
    <Box
      role="status"
      aria-label="Loading search results"
      aria-busy
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', md: 'row' },
        '@media (prefers-reduced-motion: reduce)': {
          '& .MuiSkeleton-root': { animation: 'none' }
        }
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: { xs: '100%', md: 232 },
          boxSizing: 'border-box',
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {['Image Set', 'Annotation Set', 'Rank', 'Scientific Name'].map(label => (
          <Box key={label}>
            <Typography sx={{ mb: 0.5 }}>{label}</Typography>
            {[85, 70, 90].map(width => (
              <Box key={width} sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 32 }}>
                <Skeleton variant="rounded" width={20} height={20} sx={{ flexShrink: 0 }} />
                <Skeleton width={`${width}%`} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <SearchResultsSkeleton />
    </Box>
  );
}

export function SearchResultsSkeleton({ cardCount = 6 }: { cardCount?: number }) {
  return (
    <Box
      role="status"
      aria-label="Loading search summary and annotation data"
      aria-busy
      sx={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        '@media (prefers-reduced-motion: reduce)': {
          '& .MuiSkeleton-root': { animation: 'none' }
        }
      }}
    >
      <Box
        aria-hidden
        sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, mb: 2 }}
      >
        <Typography sx={{ fontWeight: 'bold', px: 2, py: 1.5 }}>
          Summary of search parameters
        </Typography>
        <Box sx={{ px: 2, pb: 2 }}>
          {[55, 45, 60, 50].map(width => (
            <Skeleton key={width} width={`${width}%`} height={24} />
          ))}
        </Box>
      </Box>
      <Typography aria-hidden sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
        Annotation Data
      </Typography>
      <AnnotationCardsSkeleton count={cardCount} />
    </Box>
  );
}

export function AnnotationCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box
      role="status"
      aria-label="Loading annotation data"
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          '& .MuiSkeleton-root': { animation: 'none' }
        }
      }}
    >
      <Grid container spacing={3} aria-hidden>
        {Array.from({ length: count }, (_, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
            <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, p: 1.5 }}>
              <Skeleton variant="rounded" height={160} />
              <Skeleton width="75%" height={28} sx={{ mt: 1.5 }} />
              <Skeleton width="45%" height={24} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
