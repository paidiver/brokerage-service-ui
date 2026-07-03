import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { AnnotationSummary } from '../../models/annotations'

interface SearchSummaryProps {
    summary: AnnotationSummary
}

export const SearchSummary = ({ summary }: SearchSummaryProps) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                mb: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                }}
                onClick={() => setExpanded((prev) => !prev)}
            >
                <Typography sx={{ variant: 'subtitle2', fontWeight: 'bold' }}>
                    Summary of search/filter parameters
                </Typography>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                        Number of annotations: {summary.n_annotations}
                    </Typography>
                    <Typography variant="body2">
                        Number of images: {summary.n_images}
                    </Typography>
                    <Typography variant="body2">
                        Number of annotation sets: {summary.n_annotation_sets}
                    </Typography>
                    <Typography variant="body2">
                        Number of image sets: {summary.n_image_sets}
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    )
}
