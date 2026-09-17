import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { SOURCE_LABEL } from '../../constants';
import { AnnotationRecord } from '../../models/annotations';

const ImagePlaceholder = () => (
  <Box
    sx={{
      width: '100%',
      height: 140,
      bgcolor: 'grey.100',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <ImageOutlinedIcon sx={{ color: 'grey.300', fontSize: 60 }} />
  </Box>
);

export const AnnotationCard = ({
  annotation,
  onOpenDetails
}: {
  annotation: AnnotationRecord;
  onOpenDetails?: (annotation: AnnotationRecord) => void;
}) => {
  const [imgError, setImgError] = useState(false);

  const sourceLabel = annotation.source
    ? (SOURCE_LABEL[annotation.source.toLowerCase()] ?? annotation.source.toUpperCase())
    : null;

  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', borderRadius: 1, width: '100%', minHeight: 250 }}
    >
      <CardActionArea
        disabled={!onOpenDetails}
        aria-label={onOpenDetails ? `View details for ${annotation.label_name}` : undefined}
        onClick={() => onOpenDetails?.(annotation)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 1.5,
          pr: 5
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
                objectPosition: 'center'
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
            <Typography
              variant="body1"
              sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
              noWrap
            >
              {sourceLabel}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
