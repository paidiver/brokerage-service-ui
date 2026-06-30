import { AnnotationResult, Params, SearchTerms, WormsResult } from 'src/types/annotation';

export function buildSearchParams(
  page: number,
  activeSearchTerm: SearchTerms | null,
  activeIncludeDescendants: boolean,
  calculateSummary = false,
  pageSize: number
): Params {
  const params: Params = {
    page_size: pageSize,
    page,
    include_descendants: activeIncludeDescendants
  };

  if (activeSearchTerm?.fieldType === 'name_part') {
    params.name_part = activeSearchTerm.value as string;
  } else if (activeSearchTerm?.fieldType === 'aphia_ids') {
    params.aphia_ids = [(activeSearchTerm.value as [number, string])[0]];
  }
  if (calculateSummary) {
    params.calculate_summary = true;
  }

  return params;
}

export function mergeSubmissionGroups(
  previous: Record<string, AnnotationResult[]>,
  incoming: Record<string, AnnotationResult[]>
): Record<string, AnnotationResult[]> {
  const merged = { ...previous };

  for (const [groupId, items] of Object.entries(incoming)) {
    merged[groupId] = [...(merged[groupId] || []), ...items];
  }

  return merged;
}

export function getSearchChipLabel(searchTerms: SearchTerms | null): string {
  if (!searchTerms) return '';

  if (searchTerms.fieldType === 'name_part') {
    return `name part: ${searchTerms.value as string}`;
  }

  const [aphiaId, label] = searchTerms.value as [number, string];
  return `${label} (${aphiaId})`;
}

export function createNamePartSearchTerm(value: string): SearchTerms | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  return {
    fieldType: 'name_part',
    value: trimmed
  };
}

export function createAphiaSearchTerm(item: WormsResult): SearchTerms {
  const label = item.valid_name || item.scientificname;

  return {
    fieldType: 'aphia_ids',
    value: [item.AphiaID, label]
  };
}
