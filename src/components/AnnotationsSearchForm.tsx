'use client';

import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Badge, Box, TextField, Tooltip } from '@mui/material';
import { type KeyboardEvent, useState } from 'react';
import { AdditionalFilters } from 'src/components/annotations-search-form/AdditionalFilters';
import { IncludeDescendantsToggle } from 'src/components/annotations-search-form/IncludeDescendantsToggle';
import { SearchActionButton } from 'src/components/annotations-search-form/SearchActionButton';
import { SourceDropdown } from 'src/components/annotations-search-form/SourceDropdown';
import { TaxonAutocompleteField } from 'src/components/annotations-search-form/TaxonAutocompleteField';
import type { AdditionalFilters as AdditionalFiltersModel } from 'src/models/search';
import type { TaxonWormsLikeItem } from 'src/models/taxanomies';

interface AnnotationsSearchFormProps {
  shareUrl: string | null;
  shareMessage: string | null;
  onShare: () => Promise<void>;
  onClearNames: () => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;

  chipLabels: string[];
  onRemoveSearchTerm: (index: number) => void;

  includeDescendants: boolean;
  onIncludeDescendantsChange: (value: boolean) => void;

  wormsOptions: TaxonWormsLikeItem[];
  wormsLoading: boolean;
  wormsError?: string | null;
  onSelectWormsOption: (item: TaxonWormsLikeItem) => void;

  onSubmit: () => Promise<void> | void;

  selectedSources: string[];
  onSelectedSourcesChange: (sources: string[]) => void;

  additionalFilters: AdditionalFiltersModel;
  onAdditionalFiltersChange: (filters: AdditionalFiltersModel) => void;
}

export function AnnotationsSearchForm({
  shareUrl,
  shareMessage,
  onShare,
  onClearNames,
  searchInput,
  onSearchInputChange,
  onSearchInputKeyDown,
  chipLabels,
  onRemoveSearchTerm,
  includeDescendants,
  onIncludeDescendantsChange,
  wormsOptions,
  wormsLoading,
  wormsError,
  onSelectWormsOption,
  onSubmit,
  selectedSources,
  onSelectedSourcesChange,
  additionalFilters,
  onAdditionalFiltersChange
}: AnnotationsSearchFormProps) {
  const copied = shareMessage?.startsWith('Search link copied') ?? false;
  const buttonSx = {
    color: 'white',
    bgcolor: '#2C2C2C',
    '&:hover': {
      bgcolor: '#1F1F1F',
      opacity: 0.9
    }
  };

  const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);
  const activeFilterCount = Object.values(additionalFilters).filter(value =>
    typeof value === 'number'
      ? Number.isFinite(value)
      : typeof value === 'string' && value.trim() !== ''
  ).length;
  const filtersTitle =
    activeFilterCount > 0
      ? `Additional filters — ${activeFilterCount} active`
      : 'Additional filters';

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
        <Tooltip title={filtersTitle}>
          <Badge badgeContent={activeFilterCount} color="primary">
            <SearchActionButton
              ariaLabel={filtersTitle}
              iconOnly
              type="button"
              sx={
                activeFilterCount > 0
                  ? {
                      ...buttonSx,
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }
                  : buttonSx
              }
              onClick={() => setShowAdditionalFilters(!showAdditionalFilters)}
            />
          </Badge>
        </Tooltip>
        <TaxonAutocompleteField
          chipLabels={chipLabels}
          inputValue={searchInput}
          loading={wormsLoading}
          error={wormsError}
          options={wormsOptions}
          onInputChange={onSearchInputChange}
          onInputKeyDown={onSearchInputKeyDown}
          onRemoveSearchTerm={onRemoveSearchTerm}
          onSelectOption={onSelectWormsOption}
        />
        <SearchActionButton sx={{ ...buttonSx, color: 'white' }} type="submit">
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
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <Tooltip title={copied ? 'Search URL copied' : 'Copy search URL'}>
            <span>
              <SearchActionButton
                ariaLabel={copied ? 'Search URL copied' : 'Share search'}
                iconOnly
                type="button"
                sx={{ ...buttonSx, minWidth: 5, padding: 1 }}
                disabled={!shareUrl}
                onClick={onShare}
              >
                {copied ? <CheckIcon /> : <ShareOutlinedIcon />}
              </SearchActionButton>
            </span>
          </Tooltip>
          <Tooltip title="Clear scientific or common name">
            <span>
              <SearchActionButton
                ariaLabel="Clear scientific or common name"
                iconOnly
                type="button"
                sx={{ ...buttonSx, minWidth: 5, padding: 1 }}
                onClick={onClearNames}
              >
                <DeleteOutlinedIcon />
              </SearchActionButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      {shareMessage && !copied && (
        <TextField
          label="Search link"
          value={shareUrl ?? ''}
          helperText={shareMessage}
          fullWidth
          size="small"
          slotProps={{ input: { readOnly: true } }}
          onFocus={event => event.target.select()}
          sx={{ mt: 2 }}
        />
      )}
      {showAdditionalFilters && (
        <AdditionalFilters
          additionalFilters={additionalFilters}
          onAdditionalFiltersChange={onAdditionalFiltersChange}
        />
      )}
    </Box>
  );
}
