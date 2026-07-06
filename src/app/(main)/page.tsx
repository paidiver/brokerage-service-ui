'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnnotationsGrid } from 'src/components/annotations/AnnotationsGrid';
import { AnnotationsSearchForm } from 'src/components/AnnotationsSearchForm';
import { useAnnotationsSearch } from 'src/hooks/useAnnotationsSearch';
import { useWormsAutocomplete } from 'src/hooks/useWormsAutocomplete';

export default function Home() {
  const {
    annotations,
    summary,
    count,
    hasResults,
    searchInput,
    setSearchInput,
    includeDescendants,
    setIncludeDescendants,
    chipLabels,
    selectWormsOption,
    removeSearchTerm,
    handleSearchInputKeyDown,
    submitSearch,
    selectedSources,
    setSelectedSources,
    additionalFilters,
    setAdditionalFilters
  } = useAnnotationsSearch();

  const { wormsOptions, wormsLoading } = useWormsAutocomplete(searchInput);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AnnotationsSearchForm
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchInputKeyDown={handleSearchInputKeyDown}
        chipLabels={chipLabels}
        onRemoveSearchTerm={removeSearchTerm}
        includeDescendants={includeDescendants}
        onIncludeDescendantsChange={setIncludeDescendants}
        wormsOptions={wormsOptions}
        wormsLoading={wormsLoading}
        onSelectWormsOption={selectWormsOption}
        onSubmit={submitSearch}
        selectedSources={selectedSources}
        onSelectedSourcesChange={setSelectedSources}
        additionalFilters={additionalFilters}
        onAdditionalFiltersChange={setAdditionalFilters}
      />

      {hasResults && (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

          <Box
            sx={{
              width: 220,
              flexShrink: 0,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Filters coming soon
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <AnnotationsGrid
              annotations={annotations}
              summary={summary}
              totalCount={count}
              pageSize={20}
            />
          </Box>

        </Box>
      )}
    </Box>
  );
}
