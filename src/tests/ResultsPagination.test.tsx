/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ResultsPagination } from '../components/annotations/ResultsPagination';

afterEach(cleanup);
describe('results pagination', () => {
  it('matches the first-page design and supports page and next buttons', () => {
    const onPageChange = vi.fn();
    render(<ResultsPagination page={1} totalPages={68} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Search results pagination' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(
      true
    );
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(screen.getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual([
      'Previous page',
      'Page 1',
      'Page 2',
      'Page 3',
      'Page 67',
      'Page 68',
      'Next page'
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
  it('shows the current page in the middle and disables all controls while loading', () => {
    const onPageChange = vi.fn();
    render(<ResultsPagination page={34} totalPages={68} disabled onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 34' }).getAttribute('aria-current')).toBe(
      'page'
    );
    screen
      .getAllByRole('button')
      .forEach(button => expect(button.hasAttribute('disabled')).toBe(true));
  });
  it('disables next on the last page and hides pagination for zero or one page', () => {
    const { rerender } = render(
      <ResultsPagination page={68} totalPages={68} onPageChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true);
    for (const totalPages of [0, 1]) {
      rerender(<ResultsPagination page={1} totalPages={totalPages} onPageChange={vi.fn()} />);
      expect(screen.queryByRole('navigation')).toBeNull();
    }
  });
});
