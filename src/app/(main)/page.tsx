'use client';

import { AnnotationsSearchForm } from 'src/components/AnnotationsSearchForm';
import { useAnnotationsSearch } from 'src/hooks/useAnnotationsSearch';
import { useWormsAutocomplete } from 'src/hooks/useWormsAutocomplete';

export default function Home() {

  const {
    searchInput,
    setSearchInput,
    searchTerms,
    includeDescendants,
    setIncludeDescendants,
    chipLabel,
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
        chipLabel={chipLabel}
        hasSearchTerm={Boolean(searchTerms)}
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
