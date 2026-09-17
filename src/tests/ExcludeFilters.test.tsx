/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { ExcludeFilters } from '../components/annotations/ExcludeFilters';

const info = {
  image_sets: [{ uuid: 'image-id', name: 'Survey images' }],
  annotation_sets: [{ uuid: 'annotation-id', name: 'Survey annotations' }],
  aphia_ids: [
    { aphia_id: 1, scientific_name: 'First species', rank: 'Species' },
    { aphia_id: 2, scientific_name: 'Second species', rank: 'Species' }
  ]
};
afterEach(cleanup);

it('uses Info labels and excludes sets by UUID and ranks by Aphia IDs', () => {
  const onChange = vi.fn();
  render(<ExcludeFilters info={info} filters={{}} disabled={false} onChange={onChange} />);
  expect(screen.queryByText('Source')).toBeNull();
  for (const checkbox of screen.getAllByRole('checkbox'))
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Survey images' }));
  expect(onChange).toHaveBeenLastCalledWith({ exclude_image_set: ['image-id'] });
  fireEvent.click(within(screen.getByRole('group', { name: 'Rank' })).getByRole('checkbox'));
  expect(onChange).toHaveBeenLastCalledWith({ exclude_aphia_ids: [1, 2] });
});

it('allows reselecting excluded names and resets exclusions when Info is missing', () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <ExcludeFilters
      info={info}
      filters={{ exclude_aphia_ids: [1] }}
      disabled={false}
      onChange={onChange}
    />
  );
  expect(screen.getByRole('checkbox', { name: 'Species' }).getAttribute('data-indeterminate')).toBe(
    'true'
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'First species' }));
  expect(onChange).toHaveBeenLastCalledWith({ exclude_aphia_ids: [] });
  rerender(
    <ExcludeFilters
      info={null}
      filters={{ exclude_aphia_ids: [1] }}
      disabled={false}
      onChange={onChange}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reset exclusions' }));
  expect(onChange).toHaveBeenLastCalledWith({
    exclude_image_set: [],
    exclude_annotation_set: [],
    exclude_aphia_ids: []
  });
});
