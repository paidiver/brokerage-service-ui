'use client';

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { downloadAnnotationExport } from 'src/api/annotationExport';
import { retryDelay, sessionRequest, waitForPoll } from 'src/api/searchSessions';
import { MapArea } from 'src/components/annotations/mapUtils';
import { AnnotationRecord, AnnotationSearchInfo, AnnotationSummary } from 'src/models/annotations';
import { AdditionalFilters, ExcludeFilters, SearchParams, SearchTerms } from 'src/models/search';
import { TaxonWormsLikeItem } from 'src/models/taxanomies';
import {
  clearSearchUrl,
  clearStoredSearch,
  readSearch,
  readStoredSearch,
  searchSignature,
  searchUrl,
  StoredSearch,
  storeSearch
} from 'src/utils/searchLocation';

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
  additionalFilters: AdditionalFilters,
  activeIncludeDescendants: boolean,
  addSummary: boolean = false,
  addInfo: boolean = false,
  pageSize: number
): SearchParams {
  let params: SearchParams = {
    order_by: 'annotation_creation_datetime',
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

  if (additionalFilters && Object.keys(additionalFilters).length > 0) {
    params = { ...params, ...additionalFilters };
  }

  if (namePart) {
    params.name_part = namePart.value as string;
  }

  if (addSummary) {
    params.add_summary = true;
  }
  if (addInfo) {
    params.add_info = true;
  }

  return params;
}

const PAGE_SIZE = 20;

export function useAnnotationsSearch() {
  const [annotations, setAnnotations] = useState<AnnotationRecord[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<AnnotationSummary | null>(null);
  const [info, setInfo] = useState<AnnotationSearchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isRefreshingResults, setIsRefreshingResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedParams, setAppliedParams] = useState<SearchParams | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const session = useRef<StoredSearch | null>(null);
  const lastTask = useRef<SearchParams | null>(null);
  const [preparing, setPreparing] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<'retry' | 'restart' | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerms, setSearchTerms] = useState<SearchTerms[]>([]);
  const [includeDescendants, setIncludeDescendants] = useState(false);

  const hasResults = useMemo(() => annotations.length > 0, [annotations]);
  const chipLabels = useMemo(() => searchTerms.map(getSearchChipLabel), [searchTerms]);

  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const [additionalFilters, setAdditionalFilters] = useState<AdditionalFilters>({});

  const resetResults = (retainInfo = false) => {
    if (retainInfo) return;
    setInfo(null);
    setAnnotations([]);
    setSummary(null);
    setCount(0);
    setCurrentPage(1);
  };

  const updateLocation = (params: SearchParams, mode: 'push' | 'replace' | 'none') => {
    const url = searchUrl(params);
    if (mode !== 'none' && window.location.href !== url) {
      window.history[mode === 'push' ? 'pushState' : 'replaceState'](window.history.state, '', url);
    }
    setShareUrl(url);
    setShareMessage(null);
  };

  const loadData = async (
    params: SearchParams,
    existing: StoredSearch | null = null,
    mode: 'push' | 'replace' | 'none' = 'push',
    reset = true,
    labels: SearchTerms[] = searchTerms,
    retainInfo = false
  ) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    session.current = existing;
    lastTask.current = params;
    setAppliedParams(params);
    setHasSearched(true);
    setIsRefreshingResults(reset && retainInfo);
    if (reset) resetResults(retainInfo);
    if (!existing) clearStoredSearch();
    updateLocation(params, mode);
    setIsLoading(true);
    setError(null);
    setErrorAction(null);
    setPreparing(null);

    const persist = (searchId: string, expiresAt: string) => {
      const stored: StoredSearch = { version: 1, params, searchId, expiresAt, terms: labels };
      session.current = stored;
      storeSearch(stored);
    };
    const fetchPage = async () => {
      while (!controller.signal.aborted) {
        try {
          return await sessionRequest({
            method: 'GET',
            url: `/annotations/search/sessions/${session.current!.searchId}/pages/${params.page}`,
            signal: controller.signal
          });
        } catch (failure) {
          const response = (
            failure as {
              response?: {
                data?: { code?: string };
                headers?: Record<string, unknown>;
              };
            }
          )?.response;
          if (response?.data?.code !== 'search_session_busy') throw failure;
          setPreparing(`Preparing page ${params.page}…`);
          await waitForPoll(retryDelay(response.headers?.['retry-after']), controller.signal);
        }
      }
      throw new DOMException('Search cancelled', 'AbortError');
    };

    try {
      if (existing && Date.parse(existing.expiresAt) <= Date.now()) {
        throw { response: { data: { code: 'search_session_expired' } } };
      }
      let response = existing
        ? await fetchPage()
        : await sessionRequest({
            method: 'POST',
            url: '/annotations/search/sessions',
            data: { ...params, page: 1 },
            signal: controller.signal
          });
      while (!controller.signal.aborted) {
        const data = response.data;
        persist(data.meta.search_id, data.meta.expires_at);
        setCount(data.count);
        if (!('status' in data) && data.meta.page === params.page) {
          if (data.meta.info) {
            const nextInfo = data.meta.info;
            setInfo(current => {
              const merge = <T>(old: T[], next: T[], key: (item: T) => string | number) =>
                Array.from(new Map([...old, ...next].map(item => [key(item), item])).values());
              return {
                image_sets: merge(
                  current?.image_sets ?? [],
                  nextInfo.image_sets ?? [],
                  item => item.uuid
                ),
                annotation_sets: merge(
                  current?.annotation_sets ?? [],
                  nextInfo.annotation_sets ?? [],
                  item => item.uuid
                ),
                aphia_ids: merge(
                  current?.aphia_ids ?? [],
                  nextInfo.aphia_ids ?? [],
                  item => item.aphia_id
                )
              };
            });
          }
          setSummary(data.meta.summary ?? null);
          setAnnotations(data.results);
          setCurrentPage(data.meta.page);
          break;
        }
        setPreparing(
          `Preparing page ${params.page}… ${data.meta.generated_through_page} pages ready.`
        );
        if ('status' in data) await waitForPoll(response.retryAfter, controller.signal);
        response = await fetchPage();
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        const response = (failure as { response?: { status?: number; data?: { code?: string } } })
          ?.response;
        const code = response?.data?.code;
        if (
          code === 'search_session_expired' ||
          code === 'upstream_changed' ||
          response?.status === 410
        ) {
          setError(
            code === 'upstream_changed'
              ? 'The source data changed. Restart this search to continue.'
              : 'This search has expired. Restart it to load fresh results.'
          );
          setErrorAction('restart');
          session.current = null;
          clearStoredSearch();
        } else if (code === 'search_session_limit') {
          setError('This search is too large. Narrow the filters to continue.');
        } else if (code === 'upstream_ordering' || code === 'upstream_invalid') {
          setError(
            'A source returned incompatible results. Please try a different source or search.'
          );
        } else if (
          response?.status === 422 ||
          code === 'unknown_source' ||
          code === 'invalid_page'
        ) {
          setError(
            'The search filters or page are not valid. Adjust the search or restart from page 1.'
          );
          setErrorAction('restart');
        } else {
          setError(
            code === 'search_creation_limit'
              ? 'Too many searches were started. Please wait a minute and try again.'
              : 'Could not load search results. Please try again.'
          );
          setErrorAction('retry');
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsRefreshingResults(false);
        setPreparing(null);
      }
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

  const clearSearchNames = () => {
    setSearchInput('');
    setSearchTerms([]);
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

    activeRequest.current?.abort();
    resetResults();
    setAppliedParams(null);
    session.current = null;
    clearStoredSearch();
    setError(null);
    setIsLoading(false);
    setHasSearched(finalSearchTerms.length > 0);

    if (finalSearchTerms.length === 0) {
      setShareUrl(null);
      setPreparing(null);
      clearSearchUrl();
      setErrorAction(null);
      return;
    }
    console.log('Final search terms:', finalSearchTerms);

    await loadData(
      buildSearchParams(
        1,
        finalSearchTerms,
        [...selectedSources],
        { ...additionalFilters },
        includeDescendants,
        true,
        true,
        appliedParams?.page_size ?? PAGE_SIZE
      ),
      null,
      'push',
      true,
      finalSearchTerms
    );
  };

  const searchThisArea = async (area: MapArea) => {
    if (!appliedParams || isLoading) return;
    await loadData(
      { ...appliedParams, ...area, page: 1, add_summary: true, add_info: true },
      null,
      'push',
      true,
      session.current?.terms,
      true
    );
  };

  const applyExcludeFilters = async (filters: ExcludeFilters) => {
    if (!appliedParams || isLoading) return;
    const params = { ...appliedParams, ...filters, page: 1, add_summary: true, add_info: true };
    for (const key of [
      'exclude_image_set',
      'exclude_annotation_set',
      'exclude_aphia_ids'
    ] as const) {
      if (params[key]?.length === 0) delete params[key];
    }
    await loadData(params, null, 'push', true, session.current?.terms, true);
  };

  const pageSize = appliedParams?.page_size ?? PAGE_SIZE;
  const totalPages = Math.ceil(count / pageSize);
  const goToPage = async (page: number) => {
    if (
      !appliedParams ||
      isLoading ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > totalPages ||
      page === currentPage
    )
      return;
    await loadData(
      { ...appliedParams, page },
      session.current,
      'push',
      false,
      session.current?.terms
    );
  };

  const retrySearch = async () => {
    if (lastTask.current)
      await loadData(lastTask.current, session.current, 'replace', false, session.current?.terms);
  };
  const restartSearch = async () => {
    if (lastTask.current)
      await loadData({ ...lastTask.current, page: 1 }, null, 'push', true, session.current?.terms);
  };
  const shareResults = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(
        'Search link copied. It recreates this search using the latest available data.'
      );
    } catch {
      setShareMessage('Copy the search link below to share these filters and this page.');
    }
  };
  const exportResults = async () => {
    if (!appliedParams || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadAnnotationExport(appliedParams);
    } catch {
      setExportError('Could not export the search metadata. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const restore = (initial = false) => {
      if (initial && activeRequest.current) return;
      let params: SearchParams | null;
      const saved = readStoredSearch();
      try {
        params = readSearch(new URLSearchParams(window.location.search));
      } catch (failure) {
        activeRequest.current?.abort();
        setIsLoading(false);
        setPreparing(null);
        setShareUrl(null);
        setError((failure as Error).message);
        setErrorAction(null);
        return;
      }
      if (!params && initial) params = saved?.params ?? null;
      if (!params) {
        if (!initial) {
          activeRequest.current?.abort();
          resetResults();
          setHasSearched(false);
          setIsLoading(false);
          setError(null);
          setPreparing(null);
          setShareUrl(null);
          setAppliedParams(null);
          setSearchTerms([]);
          setSearchInput('');
          setSelectedSources([]);
          setAdditionalFilters({});
          setIncludeDescendants(false);
          session.current = null;
          clearStoredSearch();
        }
        return;
      }
      const matching =
        saved && searchSignature(saved.params) === searchSignature(params) ? saved : null;
      const terms: SearchTerms[] = (params.aphia_ids ?? []).map(id => {
        const term = matching?.terms.find(
          term => term.fieldType === 'aphia_ids' && term.value[0] === id
        );
        return term ?? { fieldType: 'aphia_ids', value: [id, 'Aphia ID'] };
      });
      if (params.name_part) terms.push({ fieldType: 'name_part', value: params.name_part });
      const filters: AdditionalFilters = Object.fromEntries(
        Object.entries(params).filter(([key]) =>
          [
            'deployment',
            'fauna_attraction',
            'image_set_name',
            'marine_zone',
            'max_lat',
            'max_lon',
            'min_lat',
            'min_lon',
            'platform',
            'project'
          ].includes(key)
        )
      );
      setSearchTerms(terms);
      setSearchInput('');
      setSelectedSources(params.sources ?? []);
      setIncludeDescendants(params.include_descendants ?? false);
      setAdditionalFilters(filters);
      void loadData(params, matching, initial ? 'replace' : 'none', true, terms);
    };
    // Deferring avoids duplicate POSTs during React Strict Mode's effect replay.
    const timer = setTimeout(() => restore(true), 0);
    const pop = () => restore();
    window.addEventListener('popstate', pop);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', pop);
      activeRequest.current?.abort();
    };
  }, []);

  return {
    annotations,
    count,
    summary,
    info,
    excludeFilters: {
      exclude_image_set: appliedParams?.exclude_image_set,
      exclude_annotation_set: appliedParams?.exclude_annotation_set,
      exclude_aphia_ids: appliedParams?.exclude_aphia_ids
    } satisfies ExcludeFilters,
    applyExcludeFilters,
    isLoading,
    isExporting,
    exportError,
    exportResults,
    isRefreshingResults,
    currentPage,
    totalPages,
    pageSize,
    preparing,
    errorAction,
    retrySearch,
    restartSearch,
    shareUrl,
    shareMessage,
    shareResults,
    hasSearched,
    error,
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
    clearSearchNames,
    handleSearchInputKeyDown,
    submitSearch,
    goToPage,
    searchThisArea,
    selectedSources,
    setSelectedSources,
    additionalFilters,
    setAdditionalFilters
  };
}
