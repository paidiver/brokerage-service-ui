import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { SelectField, TextInputField } from 'src/components/annotations-search-form/FormFields';
import type {
  AdditionalFilters as AdditionalFiltersModel,
  Deployment,
  FaunaAttraction,
  MarineZone
} from 'src/models/search';
import { deploymentOptions, faunaAttractionOptions, marineZoneOptions } from 'src/models/search';

interface AdditionalFiltersProps {
  additionalFilters: AdditionalFiltersModel;
  onAdditionalFiltersChange: (filters: AdditionalFiltersModel) => void;
}

type DraftFilters = Record<keyof AdditionalFiltersModel, string>;
type BoundFilterKey = 'max_lat' | 'max_lon' | 'min_lat' | 'min_lon';
type BoundFilterErrors = Partial<Record<BoundFilterKey, string>>;

const latitudeBounds = { min: -90, max: 90 };
const longitudeBounds = { min: -180, max: 180 };

function numberFieldSlotProps(min: number, max: number) {
  return {
    htmlInput: {
      min,
      max,
      step: 'any'
    }
  };
}

function filtersToDraft(filters: AdditionalFiltersModel): DraftFilters {
  return {
    deployment: filters.deployment ?? '',
    fauna_attraction: filters.fauna_attraction ?? '',
    image_set_name: filters.image_set_name ?? '',
    marine_zone: filters.marine_zone ?? '',
    max_lat: filters.max_lat?.toString() ?? '',
    max_lon: filters.max_lon?.toString() ?? '',
    min_lat: filters.min_lat?.toString() ?? '',
    min_lon: filters.min_lon?.toString() ?? '',
    platform: filters.platform ?? '',
    project: filters.project ?? ''
  };
}

const emptyDraftFilters = filtersToDraft({});

function addTextFilter(
  filters: AdditionalFiltersModel,
  key: 'image_set_name' | 'platform' | 'project',
  value: string
) {
  const trimmed = value.trim();
  if (trimmed) filters[key] = trimmed;
}

function addNumberFilter(
  filters: AdditionalFiltersModel,
  key: 'max_lat' | 'max_lon' | 'min_lat' | 'min_lon',
  value: string
) {
  if (value.trim() === '') return;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) filters[key] = numericValue;
}

function draftToFilters(draft: DraftFilters): AdditionalFiltersModel {
  const filters: AdditionalFiltersModel = {};

  if (draft.deployment) filters.deployment = draft.deployment as Deployment;
  if (draft.fauna_attraction) filters.fauna_attraction = draft.fauna_attraction as FaunaAttraction;
  if (draft.marine_zone) filters.marine_zone = draft.marine_zone as MarineZone;

  addTextFilter(filters, 'image_set_name', draft.image_set_name);
  addTextFilter(filters, 'platform', draft.platform);
  addTextFilter(filters, 'project', draft.project);

  addNumberFilter(filters, 'min_lat', draft.min_lat);
  addNumberFilter(filters, 'max_lat', draft.max_lat);
  addNumberFilter(filters, 'min_lon', draft.min_lon);
  addNumberFilter(filters, 'max_lon', draft.max_lon);

  return filters;
}

function parseBoundValue(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function validateBoundRange(
  errors: BoundFilterErrors,
  key: BoundFilterKey,
  label: string,
  value: string,
  min: number,
  max: number
) {
  if (value.trim() === '') return;

  const numericValue = parseBoundValue(value);

  if (numericValue === null) {
    errors[key] = `${label} must be a number`;
    return;
  }

  if (numericValue < min || numericValue > max) {
    errors[key] = `${label} must be between ${min} and ${max}`;
  }
}

function validateBounds(draft: DraftFilters): BoundFilterErrors {
  const errors: BoundFilterErrors = {};

  validateBoundRange(
    errors,
    'min_lat',
    'Min lat',
    draft.min_lat,
    latitudeBounds.min,
    latitudeBounds.max
  );
  validateBoundRange(
    errors,
    'max_lat',
    'Max lat',
    draft.max_lat,
    latitudeBounds.min,
    latitudeBounds.max
  );
  validateBoundRange(
    errors,
    'min_lon',
    'Min lon',
    draft.min_lon,
    longitudeBounds.min,
    longitudeBounds.max
  );
  validateBoundRange(
    errors,
    'max_lon',
    'Max lon',
    draft.max_lon,
    longitudeBounds.min,
    longitudeBounds.max
  );

  const minLat = parseBoundValue(draft.min_lat);
  const maxLat = parseBoundValue(draft.max_lat);
  const minLon = parseBoundValue(draft.min_lon);
  const maxLon = parseBoundValue(draft.max_lon);

  if (!errors.min_lat && !errors.max_lat && minLat !== null && maxLat !== null && minLat > maxLat) {
    errors.min_lat = 'Min lat cannot be higher than max lat';
    errors.max_lat = 'Max lat cannot be lower than min lat';
  }

  if (!errors.min_lon && !errors.max_lon && minLon !== null && maxLon !== null && minLon > maxLon) {
    errors.min_lon = 'Min lon cannot be higher than max lon';
    errors.max_lon = 'Max lon cannot be lower than min lon';
  }

  return errors;
}

export function AdditionalFilters({
  additionalFilters,
  onAdditionalFiltersChange
}: AdditionalFiltersProps) {
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(() =>
    filtersToDraft(additionalFilters)
  );

  useEffect(() => {
    setDraftFilters(filtersToDraft(additionalFilters));
  }, [additionalFilters]);

  const updateDraftFilter = (key: keyof DraftFilters, value: string) => {
    setDraftFilters(currentDraft => ({
      ...currentDraft,
      [key]: value
    }));
  };

  const boundErrors = useMemo(() => validateBounds(draftFilters), [draftFilters]);
  const hasBoundErrors = Object.keys(boundErrors).length > 0;
  const hasDraftFilters = Object.values(draftFilters).some(Boolean);

  const clearAllFilters = () => {
    setDraftFilters(emptyDraftFilters);
    onAdditionalFiltersChange({});
  };

  return (
    <Box
      sx={{
        width: '100%',
        mt: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 4
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2
        }}
      >
        <Typography component="h2" variant="h6">
          Filters
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2
          }}
        >
          <Button
            type="button"
            variant="text"
            color="inherit"
            disabled={!hasDraftFilters}
            onClick={clearAllFilters}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="contained"
            sx={{
              bgcolor: '#2C2C2C',
              color: 'white',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#1F1F1F',
                opacity: 0.9
              }
            }}
            disabled={hasBoundErrors}
            onClick={() => onAdditionalFiltersChange(draftToFilters(draftFilters))}
          >
            Update Filter
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <SelectField
          id="deployment-filter"
          label="Deployment"
          value={draftFilters.deployment}
          options={deploymentOptions}
          onChange={value => updateDraftFilter('deployment', value)}
        />

        <SelectField
          id="fauna-attraction-filter"
          label="Fauna attraction"
          value={draftFilters.fauna_attraction}
          options={faunaAttractionOptions}
          onChange={value => updateDraftFilter('fauna_attraction', value)}
        />

        <SelectField
          id="marine-zone-filter"
          label="Marine zone"
          value={draftFilters.marine_zone}
          options={marineZoneOptions}
          onChange={value => updateDraftFilter('marine_zone', value)}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextInputField
          label="Image set"
          value={draftFilters.image_set_name}
          onChange={value => updateDraftFilter('image_set_name', value)}
        />

        <TextInputField
          label="Platform"
          value={draftFilters.platform}
          onChange={value => updateDraftFilter('platform', value)}
        />

        <TextInputField
          label="Project"
          value={draftFilters.project}
          onChange={value => updateDraftFilter('project', value)}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Typography component="p" variant="h6">
          Bounds:
        </Typography>
        <TextInputField
          label="Min lat"
          type="number"
          value={draftFilters.min_lat}
          error={Boolean(boundErrors.min_lat)}
          helperText={boundErrors.min_lat}
          slotProps={numberFieldSlotProps(latitudeBounds.min, latitudeBounds.max)}
          onChange={value => updateDraftFilter('min_lat', value)}
        />
        <TextInputField
          label="Max lat"
          type="number"
          value={draftFilters.max_lat}
          error={Boolean(boundErrors.max_lat)}
          helperText={boundErrors.max_lat}
          slotProps={numberFieldSlotProps(latitudeBounds.min, latitudeBounds.max)}
          onChange={value => updateDraftFilter('max_lat', value)}
        />
        <TextInputField
          label="Min lon"
          type="number"
          value={draftFilters.min_lon}
          error={Boolean(boundErrors.min_lon)}
          helperText={boundErrors.min_lon}
          slotProps={numberFieldSlotProps(longitudeBounds.min, longitudeBounds.max)}
          onChange={value => updateDraftFilter('min_lon', value)}
        />
        <TextInputField
          label="Max lon"
          type="number"
          value={draftFilters.max_lon}
          error={Boolean(boundErrors.max_lon)}
          helperText={boundErrors.max_lon}
          slotProps={numberFieldSlotProps(longitudeBounds.min, longitudeBounds.max)}
          onChange={value => updateDraftFilter('max_lon', value)}
        />
      </Box>
    </Box>
  );
}
