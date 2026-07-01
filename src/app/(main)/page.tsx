'use client';

import { AnnotationsSearchForm } from 'src/components/AnnotationsSearchForm';
import { useAnnotationsSearch } from 'src/hooks/useAnnotationsSearch';
import { useWormsAutocomplete } from 'src/hooks/useWormsAutocomplete';

export default function Home() {

  const {
    searchInput,
    setSearchInput,
    includeDescendants,
    setIncludeDescendants,
    chipLabels,
    selectWormsOption,
    removeSearchTerm,
    handleSearchInputKeyDown,
    submitSearch,
  } = useAnnotationsSearch();

  const { wormsOptions, wormsLoading } = useWormsAutocomplete(searchInput);

  return (
    <div>
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
      />

    </div>
  );
}
