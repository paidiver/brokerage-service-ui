'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from 'src/api/apiClient';
import { TaxonWormsLikeItem, TaxonWormsLikeResponse } from 'src/models/taxanomies';

interface UseWormsAutocompleteReturn {
  wormsOptions: TaxonWormsLikeItem[];
  wormsLoading: boolean;
  clearWormsOptions: () => void;
}

export function useWormsAutocomplete(searchInput: string): UseWormsAutocompleteReturn {
  const [wormsOptions, setWormsOptions] = useState<TaxonWormsLikeItem[]>([]);
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

        const results = await apiRequest<TaxonWormsLikeResponse>({
          method: 'GET',
          url: `/taxa/ajax_by_name_part/${term}`
        });

        if (isActive) {
          setWormsOptions(results.results);
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
