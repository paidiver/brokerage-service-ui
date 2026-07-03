import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { SOURCE_LABEL } from '../../constants'
import { AnnotationRecord } from '../../models/annotations'

const ImagePlaceholder = () => (
  <Box
    sx={{
      width: '100%',
      height: 140,
      bgcolor: 'grey.100',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <ImageOutlinedIcon sx={{ color: 'grey.300', fontSize: 60 }} />
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
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        pt: 1.5,
        pl: 1.5,
        pb: 1.5,
        pr: 5,
        borderRadius: 1,
        width: '100%', 
        minHeight: 250, 
      }}
    >
      <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 0.5 }}>
        {annotation.image_handle && !imgError ? (
          <CardMedia
            component="img"
            image={annotation.image_handle}
            alt={annotation.image_filename ?? 'Annotation image'}
            onError={() => setImgError(true)}
            sx={{
              height: 160,
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </Box>

      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5, 
          px: 0.5,
          pt: 1.5, 
          pb: '0 !important' 
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }} noWrap>
          {annotation.label_name ?? '—'}
        </Typography>

        {sourceLabel && (
          <Typography variant="body1" sx={{ alignSelf: 'flex-start', color: 'text.secondary' }} noWrap>
            {sourceLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}