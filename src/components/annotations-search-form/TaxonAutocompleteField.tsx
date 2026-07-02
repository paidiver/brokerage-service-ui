import { Autocomplete, Box, Chip, CircularProgress, TextField, Typography } from '@mui/material';
import type { KeyboardEvent } from 'react';
import type { TaxonWormsLikeItem } from 'src/models/taxanomies';

interface TaxonAutocompleteFieldProps {
  chipLabels: string[];
  inputValue: string;
  loading: boolean;
  options: TaxonWormsLikeItem[];
  onInputChange: (value: string) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRemoveSearchTerm: (index: number) => void;
  onSelectOption: (item: TaxonWormsLikeItem) => void;
}

export function TaxonAutocompleteField({
  chipLabels,
  inputValue,
  loading,
  options,
  onInputChange,
  onInputKeyDown,
  onRemoveSearchTerm,
  onSelectOption
}: TaxonAutocompleteFieldProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 320, borderRadius: 2 }}>
      <Autocomplete<TaxonWormsLikeItem, false, false, false>
        fullWidth
        options={options}
        loading={loading}
        inputValue={inputValue}
        value={null}
        openOnFocus
        filterOptions={availableOptions => availableOptions}
        getOptionLabel={option => option.scientificname ?? ''}
        isOptionEqualToValue={(option, value) => option.AphiaID === value.AphiaID}
        onInputChange={(_, value) => {
          onInputChange(value);
        }}
        onChange={(_, selectedItem) => {
          if (selectedItem) {
            onSelectOption(selectedItem);
          }
        }}
        renderInput={params => {
          const inputSlotProps = params.slotProps?.input ?? {};
          const htmlInputSlotProps = params.slotProps?.htmlInput ?? {};
          const selectedTermChips = chipLabels.map((chipLabel, index) => (
            <Chip
              key={`${chipLabel}-${index}`}
              label={chipLabel}
              onDelete={() => onRemoveSearchTerm(index)}
              color="default"
              variant="outlined"
              size="small"
              sx={{ maxWidth: '100%' }}
            />
          ));

          return (
            <TextField
              {...params}
              label="Scientific or common name"
              size="small"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  py: 0.5,
                  pl: 1,

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'black'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'black'
                },

                '& .MuiAutocomplete-input': {
                  flexGrow: 1,
                  minWidth: 180
                }
              }}
              slotProps={{
                ...params.slotProps,
                input: {
                  ...inputSlotProps,
                  startAdornment: (
                    <>
                      {selectedTermChips}
                      {inputSlotProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {loading && <CircularProgress color="inherit" size={20} />}
                      {inputSlotProps.endAdornment}
                    </>
                  )
                },
                htmlInput: {
                  ...htmlInputSlotProps,
                  'aria-label': 'Search taxa',
                  onKeyDown: onInputKeyDown
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
  );
}
