'use client';

import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { ReactNode, useEffect, useState } from 'react';
import { SOURCE_LABEL } from 'src/constants';
import { SearchActionButton } from 'src/components/annotations-search-form/SearchActionButton';
import { AnnotationRecord } from 'src/models/annotations';
import { blueScrollbarSx } from 'src/styles/scrollbars';

type Props = {
  annotation: AnnotationRecord | null;
  onClose: () => void;
};

type Detail = { label: string; value: ReactNode };

function displayValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return 'Not available';
  return String(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function DetailSection({ title, details }: { title: string; details: Detail[] }) {
  return (
    <Box component="section">
      <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        {title}
      </Typography>
      <Box
        component="dl"
        sx={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr', gap: 1, m: 0 }}
      >
        {details.map(detail => (
          <Box key={detail.label} sx={{ display: 'contents' }}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {detail.label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
              {displayValue(detail.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function AnnotationDetailsDialog({ annotation, onClose }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => setImageError(false), [annotation?.source, annotation?.uuid]);

  if (!annotation) return null;

  const source = annotation.source
    ? (SOURCE_LABEL[annotation.source.toLowerCase()] ?? annotation.source.toUpperCase())
    : 'Not available';
  const coordinates = annotation.annotation_coordinates?.length
    ? annotation.annotation_coordinates.map(point => point.join(', ')).join(' · ')
    : null;

  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      onClose={onClose}
      slotProps={{ paper: { sx: { minHeight: { md: 600 } } } }}
    >
      <DialogTitle sx={{ pr: 7 }}>
        Annotation details
        <IconButton
          aria-label="Close annotation details"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={blueScrollbarSx}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) minmax(360px, 1.25fr)' },
            gap: { xs: 3, md: 5 }
          }}
        >
          <Box>
            {annotation.image_handle && !imageError ? (
              <Box
                component="img"
                src={annotation.image_handle}
                alt={annotation.image_filename || 'Annotation image'}
                onError={() => setImageError(true)}
                sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 520,
                  objectFit: 'contain',
                  bgcolor: 'grey.100'
                }}
              />
            ) : (
              <Box
                sx={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100'
                }}
              >
                <ImageOutlinedIcon sx={{ color: 'grey.300', fontSize: 120 }} />
              </Box>
            )}
            <SearchActionButton
              href={annotation.image_handle ?? undefined}
              download={annotation.image_filename || 'annotation-image'}
              disabled={!annotation.image_handle || imageError}
              sx={{ mt: 2, width: '100%' }}
              type="button"
            >
              <DownloadIcon sx={{ mr: 1 }} />
              Download image
            </SearchActionButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <DetailSection
              title="Annotation information"
              details={[
                { label: 'Scientific name', value: annotation.label_name },
                { label: 'Aphia ID', value: annotation.label_aphia_id },
                { label: 'Annotation UUID', value: annotation.uuid },
                { label: 'Created', value: formatDate(annotation.annotation_creation_datetime) },
                { label: 'Annotator', value: annotation.annotator_name },
                { label: 'Platform', value: annotation.annotation_platform },
                { label: 'Shape', value: annotation.annotation_shape },
                { label: 'Dimensions (pixels)', value: annotation.annotation_dimension_pixels },
                { label: 'Coordinates', value: coordinates }
              ]}
            />
            <Divider />
            <DetailSection
              title="Annotation set information"
              details={[
                { label: 'Name', value: annotation.annotation_set_name },
                { label: 'UUID', value: annotation.annotation_set_uuid }
              ]}
            />
            <Divider />
            <DetailSection
              title="Image information"
              details={[
                { label: 'Filename', value: annotation.image_filename },
                { label: 'Image UUID', value: annotation.image_uuid },
                { label: 'Latitude', value: annotation.image_latitude },
                { label: 'Longitude', value: annotation.image_longitude }
              ]}
            />
            <Divider />
            <DetailSection
              title="Image set information"
              details={[
                { label: 'Name', value: annotation.image_set_name },
                { label: 'UUID', value: annotation.image_set_uuid }
              ]}
            />
            <Divider />
            <DetailSection title="Source" details={[{ label: 'Provider', value: source }]} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
