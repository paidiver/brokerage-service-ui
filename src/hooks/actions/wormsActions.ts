import axios from 'axios';
import { WormsResult } from 'src/types/annotation';

export const WORMS_BASE = `${process.env.NEXT_PUBLIC_WORMS_API || 'http://localhost:8001'}/api/`;
export const WORMS_URL = 'taxa/ajax_by_name_part/';

export async function fetchWormsByNamePart(term: string): Promise<WormsResult[]> {
  const trimmed = term.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const response = await axios.get(
    `${WORMS_BASE}${WORMS_URL}${encodeURIComponent(trimmed)}/?combine_vernaculars=true`
  );

  return Array.isArray(response.data) ? response.data : [];
}
