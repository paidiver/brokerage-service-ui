'use client';

import { Box } from '@mui/material';
import type { KeyboardEvent } from 'react';
import { IncludeDescendantsToggle } from 'src/components/annotations-search-form/IncludeDescendantsToggle';
import { SearchActionButton } from 'src/components/annotations-search-form/SearchActionButton';
import { SourceSelect } from 'src/components/annotations-search-form/SourceSelect';
import { TaxonAutocompleteField } from 'src/components/annotations-search-form/TaxonAutocompleteField';
import type { TaxonWormsLikeItem } from 'src/models/taxanomies';

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
      bgcolor: '#1F1F1F',
      opacity: 0.9
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
        <SearchActionButton ariaLabel="Apply filters" iconOnly sx={buttonSx} />
        <TaxonAutocompleteField
          chipLabels={chipLabels}
          inputValue={searchInput}
          loading={wormsLoading}
          options={wormsOptions}
          onInputChange={onSearchInputChange}
          onInputKeyDown={onSearchInputKeyDown}
          onRemoveSearchTerm={onRemoveSearchTerm}
          onSelectOption={onSelectWormsOption}
        />
        <SearchActionButton sx={{ ...buttonSx, color: 'white' }}>Search</SearchActionButton>
        <IncludeDescendantsToggle
          checked={includeDescendants}
          onChange={onIncludeDescendantsChange}
        />
        <SourceSelect />
      </Box>
    </Box>
  );
}
