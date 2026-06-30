'use client';

import { KeyboardEvent, useMemo, useState } from 'react';
import { fetchGroupedAnnotations } from 'src/hooks/actions/annotationActions';
import {
  createAphiaSearchTerm,
  createNamePartSearchTerm,
  getSearchChipLabel,
  mergeSubmissionGroups
} from 'src/hooks/actions/utils';
import { AnnotationResult, SearchTerms, SummaryResult, WormsResult } from 'src/types/annotation';

export function useAnnotationsSearch() {
  const [submissions, setSubmissions] = useState<Record<string, AnnotationResult[]>>({});
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);

  const [appliedSearchTerm, setAppliedSearchTerm] = useState<SearchTerms | null>(null);
  const [appliedIncludeDescendants, setAppliedIncludeDescendants] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerms, setSearchTerms] = useState<SearchTerms | null>(null);
  const [includeDescendants, setIncludeDescendants] = useState(false);

  const hasResults = useMemo(() => Object.keys(submissions).length > 0, [submissions]);
  const chipLabel = useMemo(() => getSearchChipLabel(searchTerms), [searchTerms]);

  const resetResults = () => {
    setSubmissions({});
    setSummary(null);
    setCount(0);
    setNextPage(null);
  };

  const loadData = async (
    page: number,
    activeSearchTerm: SearchTerms | null,
    activeIncludeDescendants: boolean
  ) => {
    setIsLoading(true);

    try {
      const data = await fetchGroupedAnnotations(page, activeSearchTerm, activeIncludeDescendants);
      if (!data) {
        resetResults();
        return;
      }

      setCount(data.count);
      setSummary(data.results.summary);

      if (page === 1) {
        setSubmissions(data.results.annotations);
      } else {
        setSubmissions(previous => mergeSubmissionGroups(previous, data.results.annotations));
      }

      setNextPage(data.next ? page + 1 : null);
    } catch (error) {
      console.error('Failed to load grouped annotations:', error);

      if (page === 1) {
        resetResults();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addNamePartSearch = (value: string) => {
    const nextTerm = createNamePartSearchTerm(value);
    if (!nextTerm) return;

    setSearchTerms(nextTerm);
    setSearchInput('');
  };

  const selectWormsOption = (item: WormsResult) => {
    setSearchTerms(createAphiaSearchTerm(item));
    setSearchInput('');
  };

  const removeSearchTerm = () => {
    setSearchTerms(null);
  };

  const handleSearchInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (searchInput.trim()) {
        addNamePartSearch(searchInput);
      }
    }

    if (e.key === 'Backspace' && searchInput === '' && searchTerms) {
      e.preventDefault();
      setSearchTerms(null);
    }
  };

  const submitSearch = async () => {
    let finalSearchTerm = searchTerms;

    if (!finalSearchTerm && searchInput.trim()) {
      finalSearchTerm = createNamePartSearchTerm(searchInput);
      setSearchTerms(finalSearchTerm);
      setSearchInput('');
    }

    setAppliedSearchTerm(finalSearchTerm);
    setAppliedIncludeDescendants(includeDescendants);

    if (!finalSearchTerm) {
      resetResults();
      return;
    }

    await loadData(1, finalSearchTerm, includeDescendants);
  };

  const loadMore = async () => {
    if (nextPage === null) return;
    await loadData(nextPage, appliedSearchTerm, appliedIncludeDescendants);
  };

  return {
    submissions,
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
    chipLabel,

    addNamePartSearch,
    selectWormsOption,
    removeSearchTerm,
    handleSearchInputKeyDown,
    submitSearch,
    loadMore
  };
}
