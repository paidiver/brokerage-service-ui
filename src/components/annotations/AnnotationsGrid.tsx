'use client';

import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { AnnotationRecord, AnnotationSummary } from '../../models/annotations';
import { AnnotationCard } from './AnnotationCard';
import { AnnotationDetailsDialog } from './AnnotationDetailsDialog';
import { AnnotationCardsSkeleton, SearchResultsSkeleton } from './AnnotationsSkeleton';
import { SearchSummary } from './AnnotationsSummary';
import { MapArea } from './mapUtils';
import { ResultsPagination } from './ResultsPagination';

const AnnotationsMap = dynamic(() => import('./AnnotationsMap'), { ssr: false });

interface AnnotationsGridProps {
  annotations: AnnotationRecord[];
  summary: AnnotationSummary | null;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isRefreshingResults: boolean;
  onSearchArea: (area: MapArea) => void;
  onPageChange: (page: number) => void;
}

const EmptyState = () => (
  <Box
    sx={{
      py: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      color: 'text.secondary'
    }}
  >
    <Typography variant="h6">No results found</Typography>
    <Typography variant="body2">Try adjusting your search term or source selection.</Typography>
  </Box>
);

export const AnnotationsGrid = ({
  annotations,
  summary,
  totalCount,
  pageSize,
  currentPage,
  totalPages,
  isLoading,
  isRefreshingResults,
  onPageChange,
  onSearchArea
}: AnnotationsGridProps) => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationRecord | null>(null);

  if (annotations.length === 0) {
    return isLoading ? <SearchResultsSkeleton /> : <EmptyState />;
  }

  return (
    <Box aria-busy={isLoading} sx={{ position: 'relative' }}>
      {isRefreshingResults && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: 'background.default',
            overflow: 'hidden'
          }}
        >
          <SearchResultsSkeleton cardCount={view === 'grid' ? annotations.length : 6} />
        </Box>
      )}
      <Box
        aria-hidden={isRefreshingResults || undefined}
        sx={{ visibility: isRefreshingResults ? 'hidden' : 'visible' }}
      >
        {summary && <SearchSummary summary={summary} />}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            sx={{ variant: 'subtitle2', fontWeight: 'bold', mb: 2, color: 'text.secondary' }}
          >
            Annotation Data
          </Typography>
          <Box role="group" aria-label="Results view" sx={{ display: 'flex' }}>
            <IconButton
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              sx={{ color: view === 'grid' ? '#2c2c2c' : 'text.secondary' }}
            >
              <GridViewOutlinedIcon />
            </IconButton>
            <IconButton
              aria-label="Map view"
              aria-pressed={view === 'map'}
              onClick={() => setView('map')}
              sx={{ color: view === 'map' ? '#2c2c2c' : 'text.secondary' }}
            >
              <MapOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
        {isLoading && !isRefreshingResults ? (
          <AnnotationCardsSkeleton />
        ) : view === 'map' ? (
          <AnnotationsMap
            annotations={annotations}
            isLoading={isLoading}
            onSearchArea={onSearchArea}
            onOpenDetails={setSelectedAnnotation}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {annotations.map(annotation => (
                <Grid
                  size={{ xs: 12, sm: 6, lg: 4 }}
                  key={`${annotation.source}:${annotation.uuid}`}
                >
                  <AnnotationCard annotation={annotation} onOpenDetails={setSelectedAnnotation} />
                </Grid>
              ))}
            </Grid>
            <Typography
              role="status"
              aria-live="polite"
              sx={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clipPath: 'inset(50%)'
              }}
            >
              {isLoading
                ? 'Loading search results'
                : `Page ${currentPage} of ${totalPages}. Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} results.`}
            </Typography>
          </>
        )}
        <ResultsPagination
          page={currentPage}
          totalPages={totalPages}
          disabled={isLoading}
          onPageChange={onPageChange}
        />
      </Box>
      <AnnotationDetailsDialog
        annotation={selectedAnnotation}
        onClose={() => setSelectedAnnotation(null)}
      />
    </Box>
  );
};
