'use client';

import { Box } from '@mui/material';
import { type KeyboardEvent, useState } from 'react';
import { AdditionalFilters } from 'src/components/annotations-search-form/AdditionalFilters';
import { IncludeDescendantsToggle } from 'src/components/annotations-search-form/IncludeDescendantsToggle';
import { SearchActionButton } from 'src/components/annotations-search-form/SearchActionButton';
import { SourceDropdown } from 'src/components/annotations-search-form/SourceDropdown';
import { TaxonAutocompleteField } from 'src/components/annotations-search-form/TaxonAutocompleteField';
import type { AdditionalFilters as AdditionalFiltersModel } from 'src/models/search';
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

  selectedSources: string[];
  onSelectedSourcesChange: (sources: string[]) => void;

  additionalFilters: AdditionalFiltersModel;
  onAdditionalFiltersChange: (filters: AdditionalFiltersModel) => void;
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
  onSubmit,
  selectedSources,
  onSelectedSourcesChange,
  additionalFilters,
  onAdditionalFiltersChange
}: AnnotationsSearchFormProps) {
  const buttonSx = {
    bgcolor: '#2C2C2C',
    '&:hover': {
      bgcolor: '#1F1F1F',
      opacity: 0.9
    }
  };

  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

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
        <SearchActionButton
          ariaLabel="Apply filters"
          iconOnly
          type="button"
          sx={buttonSx}
          onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
        />
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
        <SearchActionButton
          sx={{ ...buttonSx, color: 'white' }}
          type="submit"
        >
          Search
        </SearchActionButton>
        <IncludeDescendantsToggle
          checked={includeDescendants}
          onChange={onIncludeDescendantsChange}
        />
        <SourceDropdown
          selectedSources={selectedSources}
          onSelectedSourcesChange={onSelectedSourcesChange}
        />
      </Box>
      {showAdditionalFilters && (
        <AdditionalFilters
          additionalFilters={additionalFilters}
          onAdditionalFiltersChange={onAdditionalFiltersChange}
        />
      )}
    </Box>
  );
}
