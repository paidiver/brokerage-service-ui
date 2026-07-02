'use client';

import { KeyboardEvent, useMemo, useState } from 'react';
import { apiRequest } from 'src/api/apiClient';
import { AnnotationsSearchResponse } from 'src/api/types';
import { AnnotationRecord, AnnotationSummary } from 'src/models/annotations';
import { SearchParams, SearchTerms } from 'src/models/search';
import { TaxonWormsLikeItem } from 'src/models/taxanomies';

function getSearchChipLabel(searchTerm: SearchTerms): string {
  if (searchTerm.fieldType === 'name_part') {
    return `name part: ${searchTerm.value as string}`;
  }

  const [aphiaId, label] = searchTerm.value as [number, string];
  return `${label} (${aphiaId})`;
}

function createNamePartSearchTerm(value: string): SearchTerms | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return {
    fieldType: 'name_part',
    value: trimmed
  };
}

function createAphiaSearchTerm(item: TaxonWormsLikeItem): SearchTerms {
  const label = item.valid_name || item.scientificname;

  return {
    fieldType: 'aphia_ids',
    value: [item.AphiaID, label]
  };
}

function buildSearchParams(
  page: number,
  activeSearchTerms: SearchTerms[],
  selectedSources: string[],
  activeIncludeDescendants: boolean,
  calculateSummary: boolean = false,
  pageSize: number
): SearchParams {
  const params: SearchParams = {
    page_size: pageSize,
    page,
    include_descendants: activeIncludeDescendants
  };

  const aphiaIds = activeSearchTerms
    .filter(searchTerm => searchTerm.fieldType === 'aphia_ids')
    .map(searchTerm => (searchTerm.value as [number, string])[0]);
  const namePart = activeSearchTerms.find(searchTerm => searchTerm.fieldType === 'name_part');

  if (aphiaIds.length > 0) {
    params.aphia_ids = aphiaIds;
  }

  if (selectedSources.length > 0) {
    params.sources = selectedSources;
  }

  if (namePart) {
    params.name_part = namePart.value as string;
  }

  if (calculateSummary) {
    params.calculate_summary = true;
  }

  return params;
}

export function useAnnotationsSearch() {
  const [annotations, setAnnotations] = useState<AnnotationRecord[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<AnnotationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);

  const [appliedSearchTerms, setAppliedSearchTerms] = useState<SearchTerms[]>([]);
  const [appliedIncludeDescendants, setAppliedIncludeDescendants] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerms, setSearchTerms] = useState<SearchTerms[]>([]);
  const [includeDescendants, setIncludeDescendants] = useState(false);

  const hasResults = useMemo(() => annotations.length > 0, [annotations]);
  const chipLabels = useMemo(() => searchTerms.map(getSearchChipLabel), [searchTerms]);

  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const resetResults = () => {
    setAnnotations([]);
    setSummary(null);
    setCount(0);
    setNextPage(null);
  };

  const loadData = async (
    page: number,
    activeSearchTerms: SearchTerms[],
    activeIncludeDescendants: boolean
  ) => {
    setIsLoading(true);

    try {
      const queryParams = buildSearchParams(
        page,
        activeSearchTerms,
        selectedSources,
        activeIncludeDescendants,
        true,
        20
      );

      const data = await apiRequest<AnnotationsSearchResponse>({
        method: 'GET',
        url: `/annotations/search`,
        queryParams: queryParams
      });

      if (!data) {
        resetResults();
        return;
      }

      setCount(data.count);
      setSummary(data.results.summary);
      setAnnotations(data.results.annotations);
      setNextPage(data.next ? page + 1 : null);
    } catch (error) {
      console.error('Failed to load annotations:', error);

      if (page === 1) {
        resetResults();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addSearchTerm = (nextTerm: SearchTerms) => {
    setSearchTerms(currentTerms => {
      if (nextTerm.fieldType === 'name_part') {
        return [
          ...currentTerms.filter(searchTerm => searchTerm.fieldType !== 'name_part'),
          nextTerm
        ];
      }

      const [nextAphiaId] = nextTerm.value as [number, string];
      const alreadyAdded = currentTerms.some(searchTerm => {
        if (searchTerm.fieldType !== 'aphia_ids') return false;

        const [aphiaId] = searchTerm.value as [number, string];
        return aphiaId === nextAphiaId;
      });

      if (alreadyAdded) return currentTerms;

      return [...currentTerms, nextTerm];
    });
  };

  const addNamePartSearch = (value: string) => {
    const nextTerm = createNamePartSearchTerm(value);
    if (!nextTerm) return;

    addSearchTerm(nextTerm);
    setSearchInput('');
  };

  const selectWormsOption = (item: TaxonWormsLikeItem) => {
    addSearchTerm(createAphiaSearchTerm(item));
    setSearchInput('');
  };

  const removeSearchTerm = (indexToRemove: number) => {
    setSearchTerms(currentTerms => currentTerms.filter((_, index) => index !== indexToRemove));
  };

  const handleSearchInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (searchInput.trim()) {
        addNamePartSearch(searchInput);
      }
    }

    if (e.key === 'Backspace' && searchInput === '' && searchTerms.length > 0) {
      e.preventDefault();
      setSearchTerms(currentTerms => currentTerms.slice(0, -1));
    }
  };

  const submitSearch = async () => {
    let finalSearchTerms = searchTerms;

    if (searchInput.trim()) {
      const inputSearchTerm = createNamePartSearchTerm(searchInput);

      if (inputSearchTerm) {
        finalSearchTerms = [
          ...searchTerms.filter(searchTerm => searchTerm.fieldType !== 'name_part'),
          inputSearchTerm
        ];
        setSearchTerms(finalSearchTerms);
      }

      setSearchInput('');
    }

    setAppliedSearchTerms(finalSearchTerms);
    setAppliedIncludeDescendants(includeDescendants);

    if (finalSearchTerms.length === 0) {
      resetResults();
      return;
    }

    await loadData(1, finalSearchTerms, includeDescendants);
  };

  const loadMore = async () => {
    if (nextPage === null) return;
    await loadData(nextPage, appliedSearchTerms, appliedIncludeDescendants);
  };

  return {
    annotations,
    count,
    summary,
    isLoading,
    nextPage,
    hasResults,
    searchInput,
    setSearchInput,
    searchTerms,
    includeDescendants,
    setIncludeDescendants,
    chipLabels,
    addNamePartSearch,
    selectWormsOption,
    removeSearchTerm,
    handleSearchInputKeyDown,
    submitSearch,
    loadMore,
    selectedSources,
    setSelectedSources
  };
}
