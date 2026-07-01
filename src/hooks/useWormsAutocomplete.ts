'use client';

import { useEffect, useState } from 'react';
import { SourcesInfoResponse } from 'src/models/responseModels';

import { apiRequest } from '../api/apiClient';

interface UseWormsAutocompleteReturn {
  wormsOptions: WormsResult[];
  wormsLoading: boolean;
  clearWormsOptions: () => void;
}

export function useWormsAutocomplete(searchInput: string): UseWormsAutocompleteReturn {
  const [wormsOptions, setWormsOptions] = useState<WormsResult[]>([]);
  const [wormsLoading, setWormsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchOptions = async () => {
      const term = searchInput.trim();

      if (term.length < 3) {
        setWormsOptions([]);
        return;
      }

      try {
        setWormsLoading(true);

        const results = async () =>
          await apiRequest<SourcesInfoResponse>({
            method: 'GET',
            url: '/sources'
          });
        const results = await fetchWormsByNamePart(term);

        if (isActive) {
          setWormsOptions(results);
        }
      } catch (error) {
        console.error('Failed to fetch WoRMS options:', error);
        if (isActive) {
          setWormsOptions([]);
        }
      } finally {
        if (isActive) {
          setWormsLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(fetchOptions, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  return {
    wormsOptions,
    wormsLoading,
    clearWormsOptions: () => setWormsOptions([])
  };
}
