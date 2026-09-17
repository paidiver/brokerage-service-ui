'use client';

import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SearchActionButton } from 'src/components/annotations-search-form/SearchActionButton';
import { AnnotationSearchInfo } from 'src/models/annotations';
import { ExcludeFilters as Filters } from 'src/models/search';
import { blueScrollbarSx } from 'src/styles/scrollbars';

type Props = {
  info: AnnotationSearchInfo | null;
  filters: Filters;
  disabled: boolean;
  onChange: (filters: Filters) => void;
};

export function ExcludeFilters({ info, filters, disabled, onChange }: Props) {
  const byLabel = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
  const taxa = [...(info?.aphia_ids ?? [])].sort((a, b) =>
    byLabel(a.scientific_name, b.scientific_name)
  );
  const excludedTaxa = filters.exclude_aphia_ids ?? [];
  const ranks = Array.from(
    new Set(taxa.map(taxon => taxon.rank).filter((rank): rank is string => !!rank))
  ).sort(byLabel);
  const toggleTaxa = (ids: number[], checked: boolean) => {
    onChange({
      ...filters,
      exclude_aphia_ids: checked
        ? excludedTaxa.filter(id => !ids.includes(id))
        : Array.from(new Set([...excludedTaxa, ...ids]))
    });
  };
  const groups = [
    {
      label: 'Image Set',
      options: (info?.image_sets ?? [])
        .map(item => ({ value: item.uuid, label: item.name }))
        .sort((a, b) => byLabel(a.label, b.label)),
      key: 'exclude_image_set' as const
    },
    {
      label: 'Annotation Set',
      options: (info?.annotation_sets ?? [])
        .map(item => ({ value: item.uuid, label: item.name }))
        .sort((a, b) => byLabel(a.label, b.label)),
      key: 'exclude_annotation_set' as const
    }
  ];
  const hasOptions = groups.some(group => group.options.length > 0) || taxa.length > 0;
  const checkboxStyle = {
    p: 0,
    mr: 1,
    color: 'grey.800',
    '&.Mui-checked': { color: 'grey.800' },
    '&.MuiCheckbox-indeterminate': { color: 'grey.800' },
    '& .MuiSvgIcon-root': { fontSize: 20 }
  };
  const groupStyle = { border: 0, p: 0, m: 0, minWidth: 0 };
  const labelStyle = {
    m: 0,
    minHeight: 32,
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    '& .MuiFormControlLabel-label': { fontSize: 16, minWidth: 0 }
  };
  const scrollAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 192,
    overflowY: 'auto',
    pr: 0.75,
    ...blueScrollbarSx
  };
  const truncatedLabelStyle = {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };
  const sectionHeading = (label: string, selectAll: () => void, hasExcluded: boolean) => (
    <Box
      component="legend"
      sx={{
        width: '100%',
        mb: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}
    >
      <Typography component="span" sx={{ fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Tooltip title={`Select all ${label.toLowerCase()} values`}>
        <span>
          <SearchActionButton
            ariaLabel={`Select all ${label.toLowerCase()} values`}
            iconOnly
            type="button"
            size="small"
            disabled={disabled || !hasExcluded}
            onClick={selectAll}
          >
            <LibraryAddCheckIcon fontSize="small" />
          </SearchActionButton>
        </span>
      </Tooltip>
    </Box>
  );

  return (
    <Box
      component="aside"
      aria-label="Exclude search results"
      sx={{
        width: { xs: '100%', md: 232 },
        boxSizing: 'border-box',
        flexShrink: 0,
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 2,
        p: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Exclude Filters
        </Typography>
        <Tooltip title="Reset all exclusions">
          <span style={{ alignSelf: 'flex-start' }}>
            <SearchActionButton
              ariaLabel="Reset exclusions"
              iconOnly
              type="button"
              size="small"
              disabled={disabled}
              onClick={() =>
                onChange({
                  exclude_image_set: [],
                  exclude_annotation_set: [],
                  exclude_aphia_ids: []
                })
              }
            >
              <FilterAltOffIcon fontSize="small" />
            </SearchActionButton>
          </span>
        </Tooltip>
      </Box>
      {!hasOptions && (
        <Typography variant="body2" color="text.secondary">
          {disabled ? 'Loading filters…' : 'No filter information available for these results.'}
        </Typography>
      )}
      {groups.map(
        group =>
          group.options.length > 0 && (
            <Box component="fieldset" aria-label={group.label} key={group.key} sx={groupStyle}>
              {sectionHeading(
                group.label,
                () => onChange({ ...filters, [group.key]: [] }),
                (filters[group.key]?.length ?? 0) > 0
              )}
              <Box sx={scrollAreaStyle}>
                {group.options.map(option => (
                  <FormControlLabel
                    key={option.value}
                    label={
                      <Typography component="span" title={option.label} sx={truncatedLabelStyle}>
                        {option.label}
                      </Typography>
                    }
                    sx={labelStyle}
                    control={
                      <Checkbox
                        size="small"
                        sx={checkboxStyle}
                        disabled={disabled}
                        checked={!(filters[group.key] ?? []).includes(option.value)}
                        onChange={(_, checked) =>
                          onChange({
                            ...filters,
                            [group.key]: checked
                              ? (filters[group.key] ?? []).filter(value => value !== option.value)
                              : [...(filters[group.key] ?? []), option.value]
                          })
                        }
                      />
                    }
                  />
                ))}
              </Box>
            </Box>
          )
      )}
      {ranks.length > 0 && (
        <Box component="fieldset" aria-label="Rank" sx={groupStyle}>
          {sectionHeading(
            'Rank',
            () => onChange({ ...filters, exclude_aphia_ids: [] }),
            excludedTaxa.length > 0
          )}
          <Box sx={scrollAreaStyle}>
            {ranks.map(rank => {
              const ids = taxa.filter(taxon => taxon.rank === rank).map(taxon => taxon.aphia_id);
              const included = ids.filter(id => !excludedTaxa.includes(id)).length;
              return (
                <FormControlLabel
                  key={rank}
                  label={rank}
                  sx={labelStyle}
                  control={
                    <Checkbox
                      size="small"
                      sx={checkboxStyle}
                      disabled={disabled}
                      checked={included === ids.length}
                      indeterminate={included > 0 && included < ids.length}
                      onChange={(_, checked) => toggleTaxa(ids, checked)}
                    />
                  }
                />
              );
            })}
          </Box>
        </Box>
      )}
      {taxa.length > 0 && (
        <Box component="fieldset" aria-label="Scientific Name" sx={groupStyle}>
          {sectionHeading(
            'Scientific Name',
            () => onChange({ ...filters, exclude_aphia_ids: [] }),
            excludedTaxa.length > 0
          )}
          <Box sx={scrollAreaStyle}>
            {taxa.map(taxon => (
              <FormControlLabel
                key={taxon.aphia_id}
                label={taxon.scientific_name}
                sx={labelStyle}
                control={
                  <Checkbox
                    size="small"
                    sx={checkboxStyle}
                    disabled={disabled}
                    checked={!excludedTaxa.includes(taxon.aphia_id)}
                    onChange={(_, checked) => toggleTaxa([taxon.aphia_id], checked)}
                  />
                }
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
