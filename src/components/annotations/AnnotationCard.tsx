import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { SOURCE_LABEL } from '../../constants'
import { AnnotationRecord } from '../../models/annotations'


const ImagePlaceholder = () => (
  <Box
    sx={{
      width: '100%',
      aspectRatio: '4/3',
      bgcolor: 'grey.200',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <BrokenImageIcon sx={{ color: 'grey.400', fontSize: 48 }} />
  </Box>
)

export const AnnotationCard = ({ annotation }: { annotation: AnnotationRecord }) => {
  const [imgError, setImgError] = useState(false)

  const sourceLabel = annotation.source
    ? (SOURCE_LABEL[annotation.source.toLowerCase()] ?? annotation.source.toUpperCase())
    : null

  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {annotation.image_handle && !imgError ? (
        <CardMedia
          component="img"
          image={annotation.image_handle}
          alt={annotation.image_filename ?? 'Annotation image'}
          onError={() => setImgError(true)}
          sx={{ aspectRatio: '4/3', objectFit: 'cover' }}
        />
      ) : (
        <ImagePlaceholder />
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ variant: 'subtitle1', fontWeight: 'bold' }} noWrap>
          {annotation.label_name ?? '—'}
        </Typography>

        {sourceLabel && (
          <Chip
            label={sourceLabel}
            size="small"
            sx={{ alignSelf: 'flex-start', bgcolor: 'grey.100' }}
          />
        )}
      </CardContent>
    </Card>
  )
}