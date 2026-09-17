'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from 'src/api/apiClient';
import { TaxonWormsLikeItem, TaxonWormsLikeResponse } from 'src/models/taxanomies';

interface UseWormsAutocompleteReturn {
  wormsOptions: TaxonWormsLikeItem[];
  wormsLoading: boolean;
  wormsError: string | null;
  clearWormsOptions: () => void;
}

export function useWormsAutocomplete(searchInput: string): UseWormsAutocompleteReturn {
  const [wormsOptions, setWormsOptions] = useState<TaxonWormsLikeItem[]>([]);
  const [wormsLoading, setWormsLoading] = useState(false);
  const [wormsError, setWormsError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchOptions = async () => {
      const term = searchInput.trim();

      if (term.length < 3) {
        setWormsOptions([]);
        setWormsError(null);
        setWormsLoading(false);
        return;
      }

      try {
        setWormsLoading(true);
        setWormsError(null);

        const results = await apiRequest<TaxonWormsLikeResponse>({
          method: 'GET',
          url: `/taxonomy/worms/taxa/${encodeURIComponent(term)}`
        });

        if (isActive) {
          setWormsOptions(results.results);
        }
      } catch (error) {
        console.error('Failed to fetch WoRMS options:', error);
        if (isActive) {
          setWormsOptions([]);
          setWormsError('Taxonomy suggestions are unavailable. Please try again.');
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
    wormsError,
    clearWormsOptions: () => setWormsOptions([])
  };
}
