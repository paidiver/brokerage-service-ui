'use client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { AnnotationsGrid } from 'src/components/annotations/AnnotationsGrid';
import { AnnotationsSkeleton } from 'src/components/annotations/AnnotationsSkeleton';
import { ExcludeFilters } from 'src/components/annotations/ExcludeFilters';
import { AnnotationsSearchForm } from 'src/components/AnnotationsSearchForm';
import { useAnnotationsSearch } from 'src/hooks/useAnnotationsSearch';
import { useWormsAutocomplete } from 'src/hooks/useWormsAutocomplete';

export default function Home() {
  const {
    annotations,
    summary,
    info,
    excludeFilters,
    applyExcludeFilters,
    count,
    currentPage,
    totalPages,
    pageSize,
    goToPage,
    searchThisArea,
    isLoading,
    error,
    preparing,
    errorAction,
    retrySearch,
    restartSearch,
    shareUrl,
    shareMessage,
    shareResults,
    searchInput,
    setSearchInput,
    includeDescendants,
    setIncludeDescendants,
    chipLabels,
    selectWormsOption,
    removeSearchTerm,
    clearSearchNames,
    handleSearchInputKeyDown,
    submitSearch,
    selectedSources,
    setSelectedSources,
    additionalFilters,
    setAdditionalFilters
  } = useAnnotationsSearch();

  const isInitialLoading = isLoading && annotations.length === 0;

  const { wormsOptions, wormsLoading } = useWormsAutocomplete(searchInput);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AnnotationsSearchForm
        shareUrl={shareUrl}
        shareMessage={shareMessage}
        onShare={shareResults}
        onClearNames={clearSearchNames}
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

      {isLoading && <LinearProgress aria-label="Loading search results" />}
      {preparing && (
        <Typography role="status" variant="body2">
          {preparing}
        </Typography>
      )}
      {error && (
        <Alert
          severity="error"
          action={
            errorAction && (
              <Button
                color="inherit"
                size="small"
                disabled={isLoading}
                onClick={errorAction === 'restart' ? restartSearch : retrySearch}
              >
                {errorAction === 'restart' ? 'Restart search' : 'Retry'}
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}
      {isInitialLoading && <AnnotationsSkeleton />}
      <Box
        sx={{
          display: isInitialLoading ? 'none' : 'flex',
          gap: 3,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {annotations.length > 0 && (
          <ExcludeFilters
            info={info}
            filters={excludeFilters}
            disabled={isLoading}
            onChange={applyExcludeFilters}
          />
        )}

        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <AnnotationsGrid
            annotations={annotations}
            summary={summary}
            totalCount={count}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onSearchArea={searchThisArea}
            isLoading={isLoading}
          />
        </Box>
      </Box>
    </Box>
  );
}
