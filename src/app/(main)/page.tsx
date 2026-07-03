'use client';

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
    setSelectedSources
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
      />

      
    </Box>
  );
}
