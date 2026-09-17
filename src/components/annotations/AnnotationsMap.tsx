'use client';

import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { LngLatBounds, Map, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { AnnotationRecord } from '../../models/annotations';
import { AnnotationCard } from './AnnotationCard';
import { annotationPosition, MapArea, searchArea } from './mapUtils';

interface Props {
  annotations: AnnotationRecord[];
  isLoading: boolean;
  onSearchArea: (area: MapArea) => void;
  onOpenDetails: (annotation: AnnotationRecord) => void;
}

export default function AnnotationsMap({
  annotations,
  isLoading,
  onSearchArea,
  onOpenDetails
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const fitted = useRef(false);
  const [ready, setReady] = useState(false);
  const [moved, setMoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popups, setPopups] = useState<
    { element: HTMLDivElement; annotations: AnnotationRecord[] }[]
  >([]);
  const locatedCount = annotations.filter(annotation => annotationPosition(annotation)).length;

  useEffect(() => {
    if (!container.current) return;
    setReady(false);
    setMoved(false);
    setError(null);
    let map: Map;
    try {
      const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
      setWorkerUrl(`${basePath}/maplibre/maplibre-gl-worker.mjs`);
      map = new Map({
        container: container.current,
        style:
          process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
        center: [0, 20],
        zoom: 1,
        renderWorldCopies: false
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not initialize the map.');
      console.error('MapLibre initialization failed:', cause);
      return;
    }
    mapRef.current = map;
    map.addControl(new NavigationControl(), 'bottom-right');
    map.on('load', () => {
      setReady(true);
      setError(null);
    });
    map.on('error', event => {
      setError(event.error?.message || 'A map resource could not be loaded.');
      console.error('MapLibre resource error:', event.error);
    });
    map.on('moveend', event => {
      if (event.originalEvent) setMoved(true);
    });
    const resize = new ResizeObserver(() => map.resize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      fitted.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const groups = new globalThis.Map<
      string,
      { position: [number, number]; annotations: AnnotationRecord[] }
    >();
    for (const annotation of annotations) {
      const position = annotationPosition(annotation);
      if (!position) continue;
      const key = position.join(',');
      const group = groups.get(key) ?? { position, annotations: [] };
      group.annotations.push(annotation);
      groups.set(key, group);
    }
    const contents: typeof popups = [];
    const markers: Marker[] = [];
    const bounds = new LngLatBounds();
    for (const group of Array.from(groups.values())) {
      bounds.extend(group.position);
      const element = document.createElement('div');
      contents.push({ element, annotations: group.annotations });
      const popup = new Popup({ offset: 25, maxWidth: '280px' }).setDOMContent(element);
      const marker = new Marker({ color: '#302747' })
        .setLngLat(group.position)
        .setPopup(popup)
        .addTo(map);
      marker
        .getElement()
        .setAttribute(
          'aria-label',
          `${group.annotations.length} annotation(s): ${group.annotations[0].label_name ?? 'Unknown annotation'}`
        );
      markers.push(marker);
    }
    setPopups(contents);
    if (!fitted.current && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 65, maxZoom: 12, duration: 0 });
      fitted.current = true;
    }
    return () => {
      markers.forEach(marker => {
        marker.getPopup()?.remove();
        marker.remove();
      });
    };
  }, [annotations, ready]);

  return (
    <Box>
      {error && (
        <Alert severity="warning">
          The map could not fully load.
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {error}
          </Typography>
        </Alert>
      )}
      <Box
        sx={{
          position: 'relative',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Box
          ref={container}
          aria-label="Annotation locations"
          sx={{ height: { xs: 420, md: 560 }, width: '100%' }}
        />
        {moved && ready && (
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            disabled={isLoading}
            onClick={() => {
              const bounds = mapRef.current?.getBounds();
              if (bounds)
                onSearchArea(
                  searchArea(
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                  )
                );
            }}
            sx={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              bgcolor: 'white',
              color: '#302747',
              borderColor: '#302747',
              borderWidth: 2,
              borderRadius: 1,
              px: 2,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 1,
              '&:hover': { bgcolor: '#f8f6fb', borderWidth: 2 },
              '&.Mui-disabled': { bgcolor: 'white' }
            }}
          >
            Search this area
          </Button>
        )}
      </Box>
      <Typography role="status" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {annotations.length === 0
          ? 'No results in this area. Move or zoom the map to search another area.'
          : `${locatedCount} of ${annotations.length} results on this page have a map location.${locatedCount < annotations.length ? ' Results without coordinates are available in grid view.' : ''}`}
      </Typography>
      {popups.map((popup, index) =>
        createPortal(
          <Box sx={{ maxHeight: 320, overflowY: 'auto', pt: 1 }}>
            {popup.annotations.map(annotation => (
              <Box key={`${annotation.source}:${annotation.uuid}`} sx={{ mb: 1 }}>
                <AnnotationCard annotation={annotation} />
                <Button fullWidth variant="contained" onClick={() => onOpenDetails(annotation)}>
                  View details
                </Button>
              </Box>
            ))}
          </Box>,
          popup.element,
          String(index)
        )
      )}
    </Box>
  );
}
