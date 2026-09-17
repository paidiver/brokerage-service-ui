'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { AnnotationSearchInfo } from 'src/models/annotations';
import { ExcludeFilters as Filters } from 'src/models/search';

type Props = {
  info: AnnotationSearchInfo | null;
  filters: Filters;
  disabled: boolean;
  onChange: (filters: Filters) => void;
};

export function ExcludeFilters({ info, filters, disabled, onChange }: Props) {
  const taxa = info?.aphia_ids ?? [];
  const excludedTaxa = filters.exclude_aphia_ids ?? [];
  const ranks = Array.from(
    new Set(taxa.map(taxon => taxon.rank).filter((rank): rank is string => !!rank))
  ).sort();
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
      options: (info?.image_sets ?? []).map(item => ({ value: item.uuid, label: item.name })),
      key: 'exclude_image_set' as const
    },
    {
      label: 'Annotation Set',
      options: (info?.annotation_sets ?? []).map(item => ({ value: item.uuid, label: item.name })),
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
    alignItems: 'center',
    '& .MuiFormControlLabel-label': { fontSize: 16, overflowWrap: 'anywhere' }
  };

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
      {Object.values(filters).some(values => values && values.length > 0) && (
        <Button
          size="small"
          disabled={disabled}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() =>
            onChange({ exclude_image_set: [], exclude_annotation_set: [], exclude_aphia_ids: [] })
          }
        >
          Reset exclusions
        </Button>
      )}
      {!hasOptions && (
        <Typography variant="body2" color="text.secondary">
          {disabled ? 'Loading filters…' : 'No filter information available for these results.'}
        </Typography>
      )}
      {groups.map(
        group =>
          group.options.length > 0 && (
            <Box component="fieldset" key={group.key} sx={groupStyle}>
              <Typography component="legend" sx={{ mb: 0.5 }}>
                {group.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {group.options.map(option => (
                  <FormControlLabel
                    key={option.value}
                    label={option.label}
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
        <Box component="fieldset" sx={groupStyle}>
          <Typography component="legend" sx={{ mb: 0.5 }}>
            Rank
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
        <Box component="fieldset" sx={groupStyle}>
          <Typography component="legend" sx={{ mb: 0.5 }}>
            Scientific Name
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
