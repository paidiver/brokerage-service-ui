import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { AnnotationRecord, AnnotationSummary } from '../../models/annotations'
import { AnnotationCard } from './AnnotationCard'
import { SearchSummary } from './AnnotationsSummary'

interface AnnotationsGridProps {
  annotations: AnnotationRecord[]
  summary: AnnotationSummary | null
  totalCount: number
  pageSize: number
}

const EmptyState = () => (
  <Box
    sx={{
      py: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      color: 'text.secondary',
    }}
  >
    <Typography variant="h6">No results found</Typography>
    <Typography variant="body2">
      Try adjusting your search term or source selection.
    </Typography>
  </Box>
)

export const AnnotationsGrid = ({
  annotations,
  summary,
}: AnnotationsGridProps) => {

  return (
    <Box>
       {summary && <SearchSummary summary={summary} />}
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
        Annotation Data
      </Typography>

        {annotations.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <Grid container spacing={3}>
                        {annotations.map((annotation) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={annotation.uuid}>
                                <AnnotationCard annotation={annotation} />
                            </Grid>
                        ))}
                    </Grid>

                </>
            )}
    </Box>
  )
}
