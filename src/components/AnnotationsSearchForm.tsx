'use client';

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { KeyboardEvent } from 'react';
import { WormsResult } from 'src/types/annotation';

interface AnnotationsSearchFormProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;

  chipLabel: string;
  hasSearchTerm: boolean;
  onRemoveSearchTerm: () => void;

  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;

  wormsOptions: WormsResult[];
  wormsLoading: boolean;
  onSelectWormsOption: (item: WormsResult) => void;

  onSubmit: () => Promise<void> | void;
}

export function AnnotationsSearchForm({
  searchInput,
  onSearchInputChange,
  onSearchInputKeyDown,
  chipLabel,
  hasSearchTerm,
  onRemoveSearchTerm,
  includeDescendants,
  onIncludeDescendantsChange,
  wormsOptions,
  wormsLoading,
  onSelectWormsOption,
  onSubmit
}: AnnotationsSearchFormProps) {
  return (
    <Box
      component="form"
      sx={{ width: '100%' }}
      onSubmit={async e => {
        e.preventDefault();
        await onSubmit();
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
      <Box
          sx={{
            flex: 1,
            minWidth: 320,
            borderRadius: 2,
            px: 1.5,
            py: 1
          }}
        >

          {/* <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1
            }}
          > */}
            {hasSearchTerm && (
              <Chip
                label={chipLabel}
                onDelete={onRemoveSearchTerm}
                color="primary"
                variant="outlined"
              />
            )}

            {!hasSearchTerm && (
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Autocomplete
                  fullWidth
                  options={wormsOptions}
                  loading={wormsLoading}
                  inputValue={searchInput}
                  value={null}
                  openOnFocus
                  filterOptions={options => options}
                  getOptionLabel={option => option.scientificname ?? ''}
                  isOptionEqualToValue={(option, value) =>
                    option.AphiaID === value.AphiaID
                  }
                  onInputChange={(_, value) => {
                    onSearchInputChange(value);
                  }}
                  onChange={(_, selectedItem) => {
                    if (selectedItem) {
                      onSelectWormsOption(selectedItem);
                    }
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder="Scientific or Common name"
                      aria-label="Search taxa"
                      onKeyDown={onSearchInputKeyDown}
                      size="small"
                      variant="outlined"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {wormsLoading && (
                                <CircularProgress color="inherit" size={20} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }
                      }}
                    />
                  )}
                  renderOption={(props, item) => (
                    <Box component="li" {...props} key={item.AphiaID}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">
                          {item.scientificname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          AphiaID: {item.AphiaID}, Rank: {item.rank}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>
            )}
        </Box>

        <Button variant="contained" color="primary" type="submit">
          Search
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={includeDescendants}
            onChange={e => onIncludeDescendantsChange(e.target.checked)}
          />

          <Box>
            <Typography variant="body2" lineHeight={1.1}>
              include
            </Typography>
            <Typography variant="body2" lineHeight={1.1}>
              children
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
