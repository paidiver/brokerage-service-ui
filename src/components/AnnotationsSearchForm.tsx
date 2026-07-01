'use client';

import TuneIcon from '@mui/icons-material/Tune';
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
import { TaxonWormsLikeItem } from 'src/models/taxanomies';

interface AnnotationsSearchFormProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;

  chipLabels: string[];
  onRemoveSearchTerm: (index: number) => void;

  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;

  wormsOptions: TaxonWormsLikeItem[];
  wormsLoading: boolean;
  onSelectWormsOption: (item: TaxonWormsLikeItem) => void;

  onSubmit: () => Promise<void> | void;
}

export function AnnotationsSearchForm({
  searchInput,
  onSearchInputChange,
  onSearchInputKeyDown,
  chipLabels,
  onRemoveSearchTerm,
  includeDescendants,
  onIncludeDescendantsChange,
  wormsOptions,
  wormsLoading,
  onSelectWormsOption,
  onSubmit
}: AnnotationsSearchFormProps) {
  const buttonSx = {
    bgcolor: '#2C2C2C',
    '&:hover': {
      bgcolor: '#1F1F1F'
    }
  };

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
        <Button variant="contained" type="submit" sx={buttonSx}>
          <TuneIcon sx={{ mr: 1 }} />
        </Button>

        <Box
          sx={{
            flex: 1,
            minWidth: 320,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
            borderRadius: 2,
            px: 1.5,
            py: 1
          }}
        >
          {chipLabels.map((chipLabel, index) => (
            <Chip
              key={`${chipLabel}-${index}`}
              label={chipLabel}
              onDelete={() => onRemoveSearchTerm(index)}
              color="primary"
              variant="outlined"
            />
          ))}

          <Box sx={{ flex: '1 1 220px', minWidth: 180 }}>
            <Autocomplete<TaxonWormsLikeItem, false, false, false>
              fullWidth
              options={wormsOptions}
              loading={wormsLoading}
              inputValue={searchInput}
              value={null}
              openOnFocus
              filterOptions={options => options}
              getOptionLabel={option => option.scientificname ?? ''}
              isOptionEqualToValue={(option, value) => option.AphiaID === value.AphiaID}
              onInputChange={(_, value) => {
                onSearchInputChange(value);
              }}
              onChange={(_, selectedItem) => {
                if (selectedItem) {
                  onSelectWormsOption(selectedItem);
                }
              }}
              renderInput={params => {
                const inputSlotProps = params.slotProps?.input ?? {};
                const htmlInputSlotProps = params.slotProps?.htmlInput ?? {};

                return (
                  <TextField
                    {...params}
                    placeholder="Scientific or common name"
                    size="small"
                    variant="outlined"
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...inputSlotProps,
                        endAdornment: (
                          <>
                            {wormsLoading && <CircularProgress color="inherit" size={20} />}
                            {inputSlotProps.endAdornment}
                          </>
                        )
                      },
                      htmlInput: {
                        ...htmlInputSlotProps,
                        'aria-label': 'Search taxa',
                        onKeyDown: onSearchInputKeyDown
                      }
                    }}
                  />
                );
              }}
              renderOption={(props, item) => {
                const { key, ...optionProps } = props;

                return (
                  <Box component="li" key={key} {...optionProps}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{item.scientificname}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        AphiaID: {item.AphiaID}, Rank: {item.rank}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            />
          </Box>
        </Box>

        <Button variant="contained" type="submit" sx={buttonSx}>
          Search
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={includeDescendants}
            onChange={e => onIncludeDescendantsChange(e.target.checked)}
          />

          <Box>
            <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
              include
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
              children
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
