import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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
          onClick={() => onAdditionalFiltersChange(draftToFilters(draftFilters))}
        >
          Update Filter
        </Button>
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
        <div className="flex justify-items-start items-center font-bold text-sm">Bounds:</div>
        <TextInputField
          label="Min lat"
          type="number"
          value={draftFilters.min_lat}
          onChange={value => updateDraftFilter('min_lat', value)}
        />
        <TextInputField
          label="Max lat"
          type="number"
          value={draftFilters.max_lat}
          onChange={value => updateDraftFilter('max_lat', value)}
        />
        <TextInputField
          label="Min lon"
          type="number"
          value={draftFilters.min_lon}
          onChange={value => updateDraftFilter('min_lon', value)}
        />
        <TextInputField
          label="Max lon"
          type="number"
          value={draftFilters.max_lon}
          onChange={value => updateDraftFilter('max_lon', value)}
        />
      </Box>
    </Box>
  );
}
